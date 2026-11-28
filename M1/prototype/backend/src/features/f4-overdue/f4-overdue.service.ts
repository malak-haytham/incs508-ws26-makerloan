import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import { AuditLog, AuditLogDocument } from '../../audit/schemas/audit-log.schema';
import { Loan, LoanDocument, LoanStatus } from '../../loans/schemas/loan.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { User } from '../../users/schemas/user.schema';

/** R11 target: first reminder within 15 minutes of the Overdue flag. */
export const REMINDER_TARGET_MS = 15 * 60 * 1000;
/** R12: the only channel the system uses for overdue reminders. */
export const REMINDER_CHANNEL = 'email';

const FLAGGED = 'OVERDUE_FLAGGED';
const REMINDED = 'OVERDUE_REMINDER_SENT';
const SYSTEM_ACTOR = 'system';

@Injectable()
export class F4OverdueService {
  private readonly logger = new Logger(F4OverdueService.name);

  constructor(
    @InjectModel(Loan.name) private readonly loans: Model<LoanDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLogDocument>,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Scheduled job: runs every minute so a reminder is never more than ~1 minute behind its flag (R11). */
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledRun() {
    const result = await this.runCycle();
    if (result.flagged || result.reminded) {
      this.logger.log(`Overdue job: flagged ${result.flagged}, reminded ${result.reminded}`);
    }
  }

  /** One full cycle: flag first (R10), then remind (R11, R12). */
  async runCycle() {
    const flagged = await this.flagOverdue();
    const reminded = await this.sendFirstReminders();
    return { flagged, reminded, ranAt: new Date().toISOString() };
  }

  /** R10: loans whose due date and time has passed and that are not checked in become OVERDUE. */
  async flagOverdue(now = new Date()) {
    const candidates = await this.loans
      .find({ status: LoanStatus.ACTIVE, dueDate: { $lte: now }, returnedAt: { $exists: false } })
      .select('_id dueDate')
      .exec();

    let count = 0;
    for (const c of candidates) {
      // Atomic: only flag if still ACTIVE (a check-in may have happened in between).
      const loan = await this.loans.findOneAndUpdate(
        { _id: c._id, status: LoanStatus.ACTIVE },
        { status: LoanStatus.OVERDUE },
        { new: true },
      );
      if (!loan) continue;
      count++;
      await this.audit.log({
        action: FLAGGED,
        actorId: SYSTEM_ACTOR,
        entityType: 'Loan',
        entityId: loan.id,
        metadata: { dueDate: loan.dueDate.toISOString(), requirement: 'R10' },
      });
    }
    return count;
  }

  /** R11 + R12: send the first reminder by email (mocked) to the borrower's university account address. */
  async sendFirstReminders() {
    const pending = await this.loans
      .find({ status: LoanStatus.OVERDUE, lastReminderAt: { $exists: false } })
      .select('_id')
      .exec();

    let count = 0;
    for (const p of pending) {
      const sentAt = new Date();
      // Claim the loan first so the cron and a manual run can never send the same first reminder twice.
      const loan = await this.loans
        .findOneAndUpdate(
          { _id: p._id, status: LoanStatus.OVERDUE, lastReminderAt: { $exists: false } },
          { lastReminderAt: sentAt },
          { new: true },
        )
        .populate<{ borrower: User & { _id: any } }>('borrower', 'fullName email')
        .populate('equipment', 'name')
        .exec();
      if (!loan) continue;

      const to = loan.borrower.email; // university account address (borrowers log in with it)
      const item = (loan.equipment as any)?.name ?? 'equipment';
      const subject = `MakerLoan: "${item}" is overdue`;
      const body = `Hello ${loan.borrower.fullName}, the item "${item}" was due on ${loan.dueDate.toISOString()}. Please return it to the makerspace loan desk.`;

      // Mock of the university email service: no credentials, nothing leaves the machine.
      this.logger.log(`[MOCK EMAIL via university email service] to=${to} subject="${subject}"`);

      const flaggedAt = await this.flaggedAt(loan.id);
      await this.notifications.notify({
        userId: String(loan.borrower._id),
        type: 'OVERDUE_REMINDER',
        message: body,
        metadata: { channel: REMINDER_CHANNEL, to, subject, loanId: loan.id },
      });
      await this.audit.log({
        action: REMINDED,
        actorId: SYSTEM_ACTOR,
        entityType: 'Loan',
        entityId: loan.id,
        metadata: {
          channel: REMINDER_CHANNEL,
          to,
          flaggedAt: flaggedAt?.toISOString(),
          sentAt: sentAt.toISOString(),
          delayMs: flaggedAt ? sentAt.getTime() - flaggedAt.getTime() : null,
          requirement: 'R11,R12',
        },
      });
      count++;
    }
    return count;
  }

  /** Overdue loans for the loan desk, with flag time, reminder time and the R11 delay. */
  async listOverdue() {
    const loans = await this.loans
      .find({ status: LoanStatus.OVERDUE })
      .populate('equipment', 'name category')
      .populate('borrower', 'fullName email')
      .sort({ dueDate: 1 })
      .lean()
      .exec();

    const flags = await this.flagTimes(loans.map((l) => String(l._id)));
    return loans.map((l) => {
      const flaggedAt = flags.get(String(l._id)) ?? null;
      const reminderSentAt = l.lastReminderAt ?? null;
      const delayMs = flaggedAt && reminderSentAt ? reminderSentAt.getTime() - flaggedAt.getTime() : null;
      return {
        ...l,
        flaggedAt,
        reminder: {
          channel: REMINDER_CHANNEL,
          to: (l.borrower as any)?.email ?? null,
          sentAt: reminderSentAt,
          delayMs,
          withinTarget: delayMs === null ? null : delayMs <= REMINDER_TARGET_MS,
        },
      };
    });
  }

  /** R11 fit criterion for one calendar month, computed from the audit log. */
  async monthlyTimeliness(year: number, month: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    const flagged = await this.auditLogs
      .find({ action: FLAGGED, createdAt: { $gte: from, $lt: to } })
      .select('entityId createdAt')
      .lean()
      .exec();
    const reminders = await this.auditLogs
      .find({ action: REMINDED, entityId: { $in: flagged.map((f) => f.entityId) } })
      .select('entityId createdAt')
      .lean()
      .exec();
    const remindedAt = new Map(reminders.map((r: any) => [r.entityId, new Date(r.createdAt)]));

    let withinTarget = 0;
    for (const f of flagged as any[]) {
      const sent = remindedAt.get(f.entityId);
      if (sent && sent.getTime() - new Date(f.createdAt).getTime() <= REMINDER_TARGET_MS) withinTarget++;
    }
    const total = flagged.length;
    const percent = total ? Math.round((withinTarget / total) * 1000) / 10 : null;
    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      overdueLoansFlagged: total,
      remindedWithin15Min: withinTarget,
      percentWithinTarget: percent,
      targetPercent: 95,
      meetsR11: percent === null ? null : percent >= 95,
    };
  }

  private async flaggedAt(loanId: string) {
    const entry: any = await this.auditLogs
      .findOne({ action: FLAGGED, entityId: loanId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return entry ? new Date(entry.createdAt) : null;
  }

  private async flagTimes(loanIds: string[]) {
    const entries: any[] = await this.auditLogs
      .find({ action: FLAGGED, entityId: { $in: loanIds } })
      .select('entityId createdAt')
      .lean()
      .exec();
    return new Map(entries.map((e) => [e.entityId as string, new Date(e.createdAt)]));
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import { BORROWER_ROLES } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Equipment, EquipmentDocument, EquipmentStatus } from '../../equipment/schemas/equipment.schema';
import { Loan, LoanDocument, LoanStatus } from '../../loans/schemas/loan.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { Reservation, ReservationDocument, ReservationStatus } from '../../reservations/schemas/reservation.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class F2CheckoutCheckinService {
  constructor(
    @InjectModel(Equipment.name) private readonly equipment: Model<EquipmentDocument>,
    @InjectModel(Loan.name) private readonly loans: Model<LoanDocument>,
    @InjectModel(Reservation.name) private readonly reservations: Model<ReservationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async checkout(dto: CheckoutDto, actor: any) {
    const dueDate = new Date(dto.dueDate);
    if (dueDate.getTime() <= Date.now()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const borrower = await this.users.findById(dto.borrowerId);
    if (!borrower) throw new NotFoundException('Borrower not found');
    if (!BORROWER_ROLES.includes(borrower.role)) {
      throw new BadRequestException('This user is not a borrower');
    }
    if (borrower.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Borrower account is not active');
    }

    const item = await this.equipment.findById(dto.equipmentId);
    if (!item) throw new NotFoundException('Equipment not found');
    if (!item.canLeaveMakerspace) {
      throw new BadRequestException('This item is for in-makerspace use only and cannot be checked out');
    }

    // Safety check (F5) comes before anything is changed.
    if (item.requiresSafetyBriefing && !borrower.safetyCertified) {
      await this.notifications.notify({
        userId: borrower.id,
        type: 'SAFETY_BRIEFING_FAILED',
        message: `Check-out of "${item.name}" was blocked: no safety briefing recorded.`,
        metadata: { equipmentId: item.id },
      });
      throw new ForbiddenException('Borrower has no valid safety briefing for this item');
    }

    let reservation: ReservationDocument | null = null;
    if (item.status === EquipmentStatus.RESERVED) {
      reservation = await this.reservations.findOne({
        equipment: item._id,
        borrower: borrower._id,
        status: ReservationStatus.ACTIVE,
      });
      if (!reservation) throw new ConflictException('Item is reserved by another borrower');
    } else if (item.status !== EquipmentStatus.AVAILABLE) {
      throw new ConflictException(`Item is not available (status: ${item.status})`);
    }

    // Atomic update so two desks cannot check out the same item.
    const updated = await this.equipment.findOneAndUpdate(
      { _id: item._id, status: { $in: [EquipmentStatus.AVAILABLE, EquipmentStatus.RESERVED] } },
      { status: EquipmentStatus.ON_LOAN, currentHolder: borrower._id, location: 'With borrower' },
    );
    if (!updated) throw new ConflictException('Item is no longer available');

    const loan = await this.loans.create({
      equipment: item._id,
      borrower: borrower._id,
      issuedBy: actor._id,
      reservation: reservation?._id,
      checkedOutAt: new Date(),
      dueDate,
      conditionOut: item.condition,
      status: LoanStatus.ACTIVE,
    });

    if (reservation) {
      reservation.status = ReservationStatus.FULFILLED;
      await reservation.save();
    }

    await this.audit.log({
      action: 'CHECK_OUT',
      actorId: actor.id,
      entityType: 'Loan',
      entityId: loan.id,
      metadata: { equipmentId: item.id, borrowerId: borrower.id, dueDate: dueDate.toISOString() },
    });
    return loan;
  }

  async checkin(loanId: string, dto: CheckinDto, actor: any) {
    if (!isValidObjectId(loanId)) throw new BadRequestException('Invalid loan id');

    const existing = await this.loans.findById(loanId);
    if (!existing) throw new NotFoundException('Loan not found');
    if (existing.status === LoanStatus.RETURNED) {
      throw new ConflictException('Loan is already returned');
    }

    // Atomic update so a loan cannot be returned twice.
    const loan = await this.loans.findOneAndUpdate(
      { _id: loanId, status: { $in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] } },
      {
        status: LoanStatus.RETURNED,
        returnedAt: new Date(),
        receivedBy: actor._id,
        conditionIn: dto.condition,
        conditionNotes: dto.conditionNotes,
      },
      { new: true },
    );
    if (!loan) throw new ConflictException('Loan is already returned');

    await this.equipment.findByIdAndUpdate(loan.equipment, {
      status: EquipmentStatus.AVAILABLE,
      condition: dto.condition,
      currentHolder: null,
      location: 'Makerspace shelf',
    });

    await this.audit.log({
      action: 'CHECK_IN',
      actorId: actor.id,
      entityType: 'Loan',
      entityId: loan.id,
      metadata: { equipmentId: loan.equipment.toString(), condition: dto.condition },
    });
    return loan;
  }

  /** Active borrowers, for the check-out form. */
  findBorrowers() {
    return this.userModel
      .find({ role: { $in: BORROWER_ROLES }, status: UserStatus.ACTIVE })
      .select('fullName email safetyCertified')
      .sort({ fullName: 1 })
      .exec();
  }

  /** Items that can be handed out (take-home, available or reserved), for the check-out form. */
  findCheckoutEquipment() {
    return this.equipment
      .find({ canLeaveMakerspace: true, status: { $in: [EquipmentStatus.AVAILABLE, EquipmentStatus.RESERVED] } })
      .select('name category status condition requiresSafetyBriefing')
      .sort({ name: 1 })
      .exec();
  }

  /** Loans currently out (ACTIVE or OVERDUE), for the desk screen. */
  findActive() {
    return this.loans
      .find({ status: { $in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] } })
      .populate('equipment', 'name category')
      .populate('borrower', 'fullName email')
      .sort({ dueDate: 1 })
      .exec();
  }
}
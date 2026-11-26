import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import { BORROWER_ROLES } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { SafetyBriefing, SafetyBriefingDocument } from '../../safety/schemas/safety-briefing.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class F5SafetyService {
  constructor(
    @InjectModel(SafetyBriefing.name) private readonly briefings: Model<SafetyBriefingDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly audit: AuditService,
  ) {}

  listBorrowers() {
    return this.users
      .find({ role: { $in: BORROWER_ROLES }, status: UserStatus.ACTIVE })
      .select('fullName email safetyCertified')
      .sort({ fullName: 1 })
      .exec();
  }

  async listBriefings() {
    return this.briefings
      .find()
      .populate('user', 'fullName email universityId safetyCertified')
      .populate('recordedBy', 'fullName role')
      .sort({ briefedAt: -1 })
      .exec();
  }

  async getStatus(borrowerId: string) {
    if (!isValidObjectId(borrowerId)) throw new BadRequestException('Invalid borrower id');
    const borrower = await this.users.findById(borrowerId).select('fullName email role safetyCertified').exec();
    if (!borrower || !BORROWER_ROLES.includes(borrower.role)) throw new NotFoundException('Borrower not found');
    const latestBriefing = await this.briefings.findOne({ user: borrower._id }).sort({ briefedAt: -1 }).exec();
    return {
      borrower: { id: borrower.id, fullName: borrower.fullName, email: borrower.email },
      safetyCertified: borrower.safetyCertified,
      latestBriefingAt: latestBriefing?.briefedAt ?? null,
    };
  }

  async recordBriefing(borrowerId: string, actor: UserDocument) {
    if (!isValidObjectId(borrowerId)) throw new BadRequestException('Invalid borrower id');
    const borrower = await this.users.findById(borrowerId).exec();
    if (!borrower || !BORROWER_ROLES.includes(borrower.role)) throw new NotFoundException('Borrower not found');

    const briefedAt = new Date();
    const briefing = await this.briefings.create({ user: borrower._id, recordedBy: actor._id, briefedAt });
    borrower.safetyCertified = true;
    await borrower.save();
    await this.audit.log({
      action: 'SAFETY_BRIEFING_RECORDED',
      actorId: actor.id,
      entityType: 'SafetyBriefing',
      entityId: briefing.id,
      metadata: { borrowerId: borrower.id, briefedAt: briefedAt.toISOString() },
    });
    return { briefing, borrower: { id: borrower.id, fullName: borrower.fullName, safetyCertified: true } };
  }
}

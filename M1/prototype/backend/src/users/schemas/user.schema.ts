import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      delete ret.passwordHash;
      delete ret.refreshTokenHash;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true }) universityId: string;
  @Prop({ required: true }) fullName: string;
  @Prop({ required: true, unique: true, lowercase: true }) email: string;
  @Prop({ required: true, select: false }) passwordHash: string;
  @Prop({ required: true, enum: Role }) role: Role;
  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE }) status: UserStatus;
  /** F5: true once a safety briefing is recorded for this user. */
  @Prop({ default: false }) safetyCertified: boolean;
  @Prop({ select: false }) refreshTokenHash?: string;
}
export const UserSchema = SchemaFactory.createForClass(User);

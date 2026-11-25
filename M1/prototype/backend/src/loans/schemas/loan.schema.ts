import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EquipmentCondition } from '../../equipment/schemas/equipment.schema';

export type LoanDocument = HydratedDocument<Loan>;

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

@Schema({ timestamps: true })
export class Loan {
  @Prop({ type: Types.ObjectId, ref: 'Equipment', required: true }) equipment: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) borrower: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) issuedBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Reservation' }) reservation?: Types.ObjectId;
  @Prop({ type: Date, required: true }) checkedOutAt: Date;
  @Prop({ type: Date, required: true }) dueDate: Date;
  @Prop({ type: Date }) returnedAt?: Date;
  @Prop({ type: Types.ObjectId, ref: 'User' }) receivedBy?: Types.ObjectId;
  @Prop({ enum: EquipmentCondition }) conditionOut?: EquipmentCondition;
  @Prop({ enum: EquipmentCondition }) conditionIn?: EquipmentCondition;
  @Prop() conditionNotes?: string;
  @Prop({ enum: LoanStatus, default: LoanStatus.ACTIVE }) status: LoanStatus;
  /** F4: set when an overdue reminder was sent. */
  @Prop({ type: Date }) lastReminderAt?: Date;
}
export const LoanSchema = SchemaFactory.createForClass(Loan);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  FULFILLED = 'FULFILLED',
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Equipment', required: true }) equipment: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) borrower: Types.ObjectId;
  @Prop({ type: Date, required: true }) reservedFor: Date;
  @Prop({ enum: ReservationStatus, default: ReservationStatus.ACTIVE }) status: ReservationStatus;
}
export const ReservationSchema = SchemaFactory.createForClass(Reservation);

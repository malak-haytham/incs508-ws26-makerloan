import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EquipmentDocument = HydratedDocument<Equipment>;

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  ON_LOAN = 'ON_LOAN',
  RETIRED = 'RETIRED',
}
export enum EquipmentCondition {
  GOOD = 'GOOD',
  DAMAGED = 'DAMAGED',
  MISSING_PARTS = 'MISSING_PARTS',
}

@Schema({ timestamps: true })
export class Equipment {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) category: string; // electronics kit, camera, VR headset, power tool, ...
  /** true = can be taken home; false = in-makerspace use only. */
  @Prop({ required: true, default: true }) canLeaveMakerspace: boolean;
  /** F5: loans are blocked unless borrower.safetyCertified. */
  @Prop({ required: true, default: false }) requiresSafetyBriefing: boolean;
  @Prop({ enum: EquipmentStatus, default: EquipmentStatus.AVAILABLE }) status: EquipmentStatus;
  @Prop({ enum: EquipmentCondition, default: EquipmentCondition.GOOD }) condition: EquipmentCondition;
  /** F3: where the item is right now (shelf/cabinet/"with borrower"). */
  @Prop({ default: 'Makerspace shelf' }) location: string;
  /** F3: who is currently responsible for it. */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) currentHolder?: Types.ObjectId | null;
  /** Reference into the finance department's asset register. */
  @Prop() assetRegisterId?: string;
}
export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

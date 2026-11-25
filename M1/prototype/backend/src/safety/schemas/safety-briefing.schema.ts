import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SafetyBriefingDocument = HydratedDocument<SafetyBriefing>;

@Schema({ timestamps: true })
export class SafetyBriefing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) user: Types.ObjectId;
  /** Who recorded the briefing (desk assistant / safety officer). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) recordedBy: Types.ObjectId;
  @Prop({ type: Date, required: true }) briefedAt: Date;
}
export const SafetyBriefingSchema = SchemaFactory.createForClass(SafetyBriefing);

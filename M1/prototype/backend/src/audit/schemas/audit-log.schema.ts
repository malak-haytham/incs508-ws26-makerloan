import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ required: true }) action: string; // e.g. CHECK_OUT, CHECK_IN
  @Prop({ required: true }) actorId: string;
  @Prop({ required: true }) entityType: string; // e.g. Loan
  @Prop({ required: true }) entityId: string;
  @Prop({ type: Object }) metadata?: Record<string, any>;
}
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

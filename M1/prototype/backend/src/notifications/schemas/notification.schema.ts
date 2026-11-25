import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) type: string; // e.g. OVERDUE, SAFETY_BRIEFING_FAILED
  @Prop({ required: true }) message: string;
  @Prop({ default: false }) read: boolean;
  @Prop({ type: Object }) metadata?: Record<string, any>;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);

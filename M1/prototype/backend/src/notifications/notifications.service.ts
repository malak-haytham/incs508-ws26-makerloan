import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

export interface NotifyInput {
  userId: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(@InjectModel(Notification.name) private readonly model: Model<NotificationDocument>) {}

  /** Call for overdue events and safety-briefing failures. Persists + logs (channel is simulated). */
  async notify(input: NotifyInput) {
    this.logger.log(`[${input.type}] -> user ${input.userId}: ${input.message}`);
    return this.model.create(input);
  }
}

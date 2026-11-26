import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../../audit/audit.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { User, UserSchema } from '../../users/schemas/user.schema';
import { UsersModule } from '../../users/users.module';
import { F2CheckoutCheckinController } from './f2-checkout-checkin.controller';
import { F2CheckoutCheckinService } from './f2-checkout-checkin.service';

@Module({
  imports: [
    UsersModule,
    AuditModule,
    NotificationsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [F2CheckoutCheckinController],
  providers: [F2CheckoutCheckinService],
})
export class F2CheckoutCheckinModule {}
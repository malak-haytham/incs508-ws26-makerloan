import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DomainModule } from './domain.module';
import { F1AvailabilityReservationsModule } from './features/f1-availability-reservations/f1-availability-reservations.module';
import { F2CheckoutCheckinModule } from './features/f2-checkout-checkin/f2-checkout-checkin.module';
import { F3StatusTrackingModule } from './features/f3-status-tracking/f3-status-tracking.module';
import { F4OverdueModule } from './features/f4-overdue/f4-overdue.module';
import { F5SafetyModule } from './features/f5-safety/f5-safety.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGO_URI') }),
    }),
    ScheduleModule.forRoot(),
    // shared infrastructure (owned by project lead / integration owner)
    UsersModule,
    AuditModule,
    NotificationsModule,
    DomainModule,
    AuthModule,
    // features — one per member
    F1AvailabilityReservationsModule,
    F2CheckoutCheckinModule,
    F3StatusTrackingModule,
    F4OverdueModule,
    F5SafetyModule,
  ],
  controllers: [AppController],
  providers: [
    // order matters: authenticate first, then authorise by role
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

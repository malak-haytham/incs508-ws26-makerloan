import { Module } from '@nestjs/common';
import { F1AvailabilityReservationsController } from './f1-availability-reservations.controller';
import { F1AvailabilityReservationsService } from './f1-availability-reservations.service';
import { ReservationsController } from './reservations.controller';

@Module({
  controllers: [F1AvailabilityReservationsController, ReservationsController],
  providers: [F1AvailabilityReservationsService],
})
export class F1AvailabilityReservationsModule {}
import { Module } from '@nestjs/common';
import { F1AvailabilityReservationsController } from './f1-availability-reservations.controller';
import { F1AvailabilityReservationsService } from './f1-availability-reservations.service';

@Module({
  controllers: [F1AvailabilityReservationsController],
  providers: [F1AvailabilityReservationsService],
})
export class F1AvailabilityReservationsModule {}

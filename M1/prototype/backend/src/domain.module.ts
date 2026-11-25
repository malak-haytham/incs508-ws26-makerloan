import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipment, EquipmentSchema } from './equipment/schemas/equipment.schema';
import { Loan, LoanSchema } from './loans/schemas/loan.schema';
import { Reservation, ReservationSchema } from './reservations/schemas/reservation.schema';
import { SafetyBriefing, SafetyBriefingSchema } from './safety/schemas/safety-briefing.schema';

/**
 * Registers every shared Mongoose model once and exports them globally.
 * Feature modules just `@InjectModel(Equipment.name)` — no per-module forFeature needed.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Loan.name, schema: LoanSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: SafetyBriefing.name, schema: SafetyBriefingSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DomainModule {}

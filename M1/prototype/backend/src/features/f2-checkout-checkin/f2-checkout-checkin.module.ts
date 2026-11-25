import { Module } from '@nestjs/common';
import { F2CheckoutCheckinController } from './f2-checkout-checkin.controller';
import { F2CheckoutCheckinService } from './f2-checkout-checkin.service';

@Module({
  controllers: [F2CheckoutCheckinController],
  providers: [F2CheckoutCheckinService],
})
export class F2CheckoutCheckinModule {}

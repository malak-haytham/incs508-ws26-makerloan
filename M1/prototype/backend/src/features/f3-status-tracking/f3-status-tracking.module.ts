import { Module } from '@nestjs/common';
import { F3StatusTrackingController } from './f3-status-tracking.controller';
import { F3StatusTrackingService } from './f3-status-tracking.service';

@Module({
  controllers: [F3StatusTrackingController],
  providers: [F3StatusTrackingService],
})
export class F3StatusTrackingModule {}

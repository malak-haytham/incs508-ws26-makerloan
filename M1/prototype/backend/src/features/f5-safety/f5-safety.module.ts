import { Module } from '@nestjs/common';
import { F5SafetyController } from './f5-safety.controller';
import { F5SafetyService } from './f5-safety.service';

@Module({
  controllers: [F5SafetyController],
  providers: [F5SafetyService],
})
export class F5SafetyModule {}

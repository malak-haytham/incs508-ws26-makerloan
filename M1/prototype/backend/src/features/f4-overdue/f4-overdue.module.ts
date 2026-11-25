import { Module } from '@nestjs/common';
import { F4OverdueController } from './f4-overdue.controller';
import { F4OverdueService } from './f4-overdue.service';

@Module({
  controllers: [F4OverdueController],
  providers: [F4OverdueService],
})
export class F4OverdueModule {}

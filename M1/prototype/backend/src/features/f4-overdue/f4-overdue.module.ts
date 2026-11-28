import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from '../../audit/schemas/audit-log.schema';
import { F4OverdueController } from './f4-overdue.controller';
import { F4OverdueService } from './f4-overdue.service';

@Module({
  // AuditLog is read back to get each loan's flag timestamp (R11 measurement).
  imports: [MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }])],
  controllers: [F4OverdueController],
  providers: [F4OverdueService],
})
export class F4OverdueModule {}

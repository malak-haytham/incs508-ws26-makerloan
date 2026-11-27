import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Equipment id (from the availability search)', example: '665f1c2e8b1e4a0012ab34cd' })
  @IsMongoId()
  equipmentId: string;

  @ApiProperty({ description: 'R02: a future calendar day (ISO date)', example: '2026-12-01' })
  @IsDateString()
  date: string;
}
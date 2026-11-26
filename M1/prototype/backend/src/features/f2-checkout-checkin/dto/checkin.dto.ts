import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EquipmentCondition } from '../../../equipment/schemas/equipment.schema';

export class CheckinDto {
  @ApiProperty({ enum: EquipmentCondition, description: 'Condition of the item on return' })
  @IsEnum(EquipmentCondition)
  condition: EquipmentCondition;

  @ApiPropertyOptional({ description: 'Notes, e.g. which parts are missing' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  conditionNotes?: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'ID of the equipment item being handed out' })
  @IsMongoId()
  equipmentId: string;

  @ApiProperty({ description: 'ID of the borrower receiving the item' })
  @IsMongoId()
  borrowerId: string;

  @ApiProperty({ description: 'Due date (ISO 8601), entered by the desk assistant', example: '2026-12-05' })
  @IsDateString()
  dueDate: string;
}
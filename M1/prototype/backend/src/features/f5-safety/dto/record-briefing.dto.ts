import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class RecordBriefingDto {
  @ApiProperty({ description: 'University borrower who completed the safety briefing', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  borrowerId: string;
}

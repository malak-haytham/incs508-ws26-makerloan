import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class RecordBriefingDto {
  @ApiProperty({ description: 'University borrower who completed the safety briefing' })
  @IsMongoId()
  borrowerId: string;
}

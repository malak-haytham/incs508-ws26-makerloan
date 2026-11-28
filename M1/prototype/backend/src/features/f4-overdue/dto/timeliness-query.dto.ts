import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class TimelinessQueryDto {
  @ApiPropertyOptional({ description: 'Calendar year (default: current year, UTC)', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Calendar month 1-12 (default: current month, UTC)', example: 11 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

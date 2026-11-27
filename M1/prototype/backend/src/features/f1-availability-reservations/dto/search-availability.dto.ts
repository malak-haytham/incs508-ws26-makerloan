import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AvailabilityStatus } from './responses.dto';

export class SearchAvailabilityDto {
  @ApiPropertyOptional({ description: 'R01: item name, partial and case-insensitive match' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'R01: category, exact match (case-insensitive), e.g. "Power tool"' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'true = take-home items only, false = in-makerspace-only items' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : value === 'false' || value === false ? false : value))
  @IsBoolean()
  canLeaveMakerspace?: boolean;

  @ApiPropertyOptional({ enum: AvailabilityStatus, description: 'R01: only items with this status' })
  @IsOptional() @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;
}
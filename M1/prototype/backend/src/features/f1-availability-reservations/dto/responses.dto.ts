import { ApiProperty } from '@nestjs/swagger';

/** BR-01: the three availability states shown to borrowers. */
export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  CHECKED_OUT = 'CHECKED_OUT',
}

export class AvailabilityItemDto {
  @ApiProperty() _id: string;
  @ApiProperty({ example: 'Cordless Drill' }) name: string;
  @ApiProperty({ example: 'Power tool' }) category: string;
  @ApiProperty({ description: 'false = in-makerspace use only' }) canLeaveMakerspace: boolean;
  @ApiProperty() requiresSafetyBriefing: boolean;
  @ApiProperty({ example: 'Makerspace shelf' }) location: string;
  @ApiProperty({ enum: AvailabilityStatus, description: 'R01: availability status as defined in BR-01' })
  availability: AvailabilityStatus;
}

export class SearchAvailabilityResponseDto {
  @ApiProperty({ type: [AvailabilityItemDto] }) items: AvailabilityItemDto[];
  @ApiProperty({ example: 7 }) count: number;
  @ApiProperty({ example: 12, description: 'R03: server time spent on the search, in milliseconds' })
  tookMs: number;
}

export class ReservationDto {
  @ApiProperty() _id: string;
  @ApiProperty() equipment: string;
  @ApiProperty() borrower: string;
  @ApiProperty({ example: '2026-12-01T00:00:00.000Z' }) reservedFor: Date;
  @ApiProperty({ enum: ['ACTIVE', 'CANCELLED', 'FULFILLED'] }) status: string;
}

export class EquipmentSummaryDto {
  @ApiProperty() _id: string;
  @ApiProperty() name: string;
  @ApiProperty() category: string;
}

export class MyReservationDto {
  @ApiProperty() _id: string;
  @ApiProperty({ type: EquipmentSummaryDto }) equipment: EquipmentSummaryDto;
  @ApiProperty({ example: '2026-12-01T00:00:00.000Z' }) reservedFor: Date;
  @ApiProperty({ enum: ['ACTIVE', 'CANCELLED', 'FULFILLED'] }) status: string;
}
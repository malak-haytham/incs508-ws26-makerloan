import { ApiProperty } from '@nestjs/swagger';
/** Reuse in Swagger: @ApiResponse({ status: 400, type: ErrorResponseDto }) */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 }) statusCode: number;
  @ApiProperty({ example: 'Validation failed' }) message: string | string[];
  @ApiProperty({ example: 'Bad Request' }) error: string;
  @ApiProperty({ example: '2026-11-30T10:00:00.000Z' }) timestamp: string;
  @ApiProperty({ example: '/api/loans' }) path: string;
}

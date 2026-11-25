import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { F1AvailabilityReservationsService } from './f1-availability-reservations.service';

/**
 * F1 Availability & Reservations — requirements R01–R03
 * Owner: Member 1
 *
 * Every route must:
 *  - carry @ApiOperation({ summary, description: 'R0X: ...' }) with its requirement ID(s)
 *  - declare @ApiResponse for each status code (use ErrorResponseDto for errors)
 *  - use @Roles(...) where access is role-restricted (guards are global; routes are protected by default)
 *  - use @Public() only if truly unauthenticated
 * See ../../../docs/CONVENTIONS.md for a worked example.
 */
@ApiTags('F1 Availability & Reservations')
@ApiCookieAuth('access_token')
@Controller('availability')
export class F1AvailabilityReservationsController {
  constructor(private readonly service: F1AvailabilityReservationsService) {}

  // TODO(R01–R03): add endpoints here
}

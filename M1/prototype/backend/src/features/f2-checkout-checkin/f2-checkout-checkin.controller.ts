import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { F2CheckoutCheckinService } from './f2-checkout-checkin.service';

/**
 * F2 Check-out & Check-in — requirements R04–R06
 * Owner: Member 2
 *
 * Every route must:
 *  - carry @ApiOperation({ summary, description: 'R0X: ...' }) with its requirement ID(s)
 *  - declare @ApiResponse for each status code (use ErrorResponseDto for errors)
 *  - use @Roles(...) where access is role-restricted (guards are global; routes are protected by default)
 *  - use @Public() only if truly unauthenticated
 * See ../../../docs/CONVENTIONS.md for a worked example.
 */
@ApiTags('F2 Check-out & Check-in')
@ApiCookieAuth('access_token')
@Controller('loans')
export class F2CheckoutCheckinController {
  constructor(private readonly service: F2CheckoutCheckinService) {}

  // TODO(R04–R06): add endpoints here
}

import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { F3StatusTrackingService } from './f3-status-tracking.service';

/**
 * F3 Item Status & Tracking — requirements R07–R09
 * Owner: Member 3
 *
 * Every route must:
 *  - carry @ApiOperation({ summary, description: 'R0X: ...' }) with its requirement ID(s)
 *  - declare @ApiResponse for each status code (use ErrorResponseDto for errors)
 *  - use @Roles(...) where access is role-restricted (guards are global; routes are protected by default)
 *  - use @Public() only if truly unauthenticated
 * See ../../../docs/CONVENTIONS.md for a worked example.
 */
@ApiTags('F3 Item Status & Tracking')
@ApiCookieAuth('access_token')
@Controller('tracking')
export class F3StatusTrackingController {
  constructor(private readonly service: F3StatusTrackingService) {}

  // TODO(R07–R09): add endpoints here
}

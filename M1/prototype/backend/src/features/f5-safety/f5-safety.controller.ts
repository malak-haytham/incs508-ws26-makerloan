import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { F5SafetyService } from './f5-safety.service';

/**
 * F5 Safety Verification — requirements R13–R15
 * Owner: Member 5
 *
 * Every route must:
 *  - carry @ApiOperation({ summary, description: 'R0X: ...' }) with its requirement ID(s)
 *  - declare @ApiResponse for each status code (use ErrorResponseDto for errors)
 *  - use @Roles(...) where access is role-restricted (guards are global; routes are protected by default)
 *  - use @Public() only if truly unauthenticated
 * See ../../../docs/CONVENTIONS.md for a worked example.
 */
@ApiTags('F5 Safety Verification')
@ApiCookieAuth('access_token')
@Controller('safety')
export class F5SafetyController {
  constructor(private readonly service: F5SafetyService) {}

  // TODO(R13–R15): add endpoints here
}

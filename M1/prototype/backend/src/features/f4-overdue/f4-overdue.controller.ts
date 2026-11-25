import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { F4OverdueService } from './f4-overdue.service';

/**
 * F4 Overdue Handling — requirements R10–R12
 * Owner: Member 4
 *
 * Every route must:
 *  - carry @ApiOperation({ summary, description: 'R0X: ...' }) with its requirement ID(s)
 *  - declare @ApiResponse for each status code (use ErrorResponseDto for errors)
 *  - use @Roles(...) where access is role-restricted (guards are global; routes are protected by default)
 *  - use @Public() only if truly unauthenticated
 * See ../../../docs/CONVENTIONS.md for a worked example.
 */
@ApiTags('F4 Overdue Handling')
@ApiCookieAuth('access_token')
@Controller('overdue')
export class F4OverdueController {
  constructor(private readonly service: F4OverdueService) {}

  // TODO(R10–R12): add endpoints here
}

import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../../common/error-response.dto';
import { Role } from '../../common/enums/role.enum';
import { TimelinessQueryDto } from './dto/timeliness-query.dto';
import { F4OverdueService } from './f4-overdue.service';

/**
 * F4 Overdue Handling — requirements R10–R12
 * Owner: Member 4 (Mohamed Amro)
 * The flag + reminder job also runs automatically every minute (see F4OverdueService.scheduledRun).
 */
@ApiTags('F4 Overdue Handling')
@ApiCookieAuth('access_token')
@Controller('overdue')
export class F4OverdueController {
  constructor(private readonly service: F4OverdueService) {}

  @Get()
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'List overdue loans with their reminder status',
    description:
      'R10: loans whose due date and time has passed and that are not checked in are shown as Overdue. ' +
      'R11: each row shows the flag time, the reminder-sent time and the delay between them (target: 15 minutes). ' +
      'R12: the reminder channel is always email to the borrower\'s university account address.',
  })
  @ApiResponse({ status: 200, description: 'Overdue loans, oldest due date first' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  list() {
    return this.service.listOverdue();
  }

  @Post('run')
  @HttpCode(200)
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'Run the overdue job now (demo)',
    description:
      'R10, R11, R12: runs the same cycle as the every-minute scheduled job: flags overdue loans, then sends the ' +
      'first reminder by (mock) email to the borrower\'s university address and records it with a timestamp.',
  })
  @ApiResponse({ status: 200, description: 'Number of loans flagged and reminders sent in this run' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  run() {
    return this.service.runCycle();
  }

  @Get('timeliness')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'R11 check for one calendar month',
    description:
      'R11: share of overdue loans flagged in the month whose first reminder was sent within 15 minutes, ' +
      'measured as reminder-sent timestamp minus flag timestamp in the system log. Target: at least 95%.',
  })
  @ApiResponse({ status: 200, description: 'Counts, percentage and whether the 95% target is met' })
  @ApiResponse({ status: 400, description: 'Invalid year or month', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  timeliness(@Query() q: TimelinessQueryDto) {
    const now = new Date();
    return this.service.monthlyTimeliness(q.year ?? now.getUTCFullYear(), q.month ?? now.getUTCMonth() + 1);
  }
}

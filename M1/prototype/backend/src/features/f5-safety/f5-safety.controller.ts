import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../../common/error-response.dto';
import { Role } from '../../common/enums/role.enum';
import { UserDocument } from '../../users/schemas/user.schema';
import { RecordBriefingDto } from './dto/record-briefing.dto';
import { F5SafetyService } from './f5-safety.service';

@ApiTags('F5 Safety Verification')
@ApiCookieAuth('access_token')
@Controller('safety')
export class F5SafetyController {
  constructor(private readonly service: F5SafetyService) {}

  @Get('borrowers')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER, Role.SAFETY_OFFICER)
  @ApiOperation({ summary: 'List borrowers for safety review', description: 'R15: Only authorized safety staff may view active borrowers and their certification status.' })
  @ApiResponse({ status: 200, description: 'Borrowers with their current safety certification status' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  listBorrowers() {
    return this.service.listBorrowers();
  }

  @Get('briefings')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER, Role.SAFETY_OFFICER)
  @ApiOperation({ summary: 'List safety briefing history', description: 'R13, R15: Authorized safety staff review recorded briefing details and who recorded each briefing.' })
  @ApiResponse({ status: 200, description: 'Briefing records sorted by completion time, newest first' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  listBriefings() {
    return this.service.listBriefings();
  }

  @Get('status/:borrowerId')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER, Role.SAFETY_OFFICER)
  @ApiOperation({ summary: 'Check a borrower’s safety status', description: 'R14, R15: Show the certification status used by the F2 check-out gate. The F2 check-out operation rejects safety-controlled loans for uncertified borrowers.' })
  @ApiResponse({ status: 200, description: 'Borrower certification status and latest briefing time' })
  @ApiResponse({ status: 400, description: 'Invalid borrower id', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Borrower not found', type: ErrorResponseDto })
  getStatus(@Param('borrowerId') borrowerId: string) {
    return this.service.getStatus(borrowerId);
  }

  @Post('briefings')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER, Role.SAFETY_OFFICER)
  @ApiOperation({ summary: 'Record a completed safety briefing', description: 'R13, R15: Authorized safety staff record the borrower and completion time; the borrower becomes safety-certified for F2 check-out verification.' })
  @ApiResponse({ status: 201, description: 'Briefing recorded and borrower certified' })
  @ApiResponse({ status: 400, description: 'Invalid borrower id', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Borrower not found', type: ErrorResponseDto })
  recordBriefing(@Body() dto: RecordBriefingDto, @CurrentUser() user: UserDocument) {
    return this.service.recordBriefing(dto.borrowerId, user);
  }
}

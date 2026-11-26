import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../../common/error-response.dto';
import { Role } from '../../common/enums/role.enum';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { F2CheckoutCheckinService } from './f2-checkout-checkin.service';

@ApiTags('F2 Check-out & Check-in')
@ApiCookieAuth('access_token')
@Controller('loans')
export class F2CheckoutCheckinController {
  constructor(private readonly service: F2CheckoutCheckinService) {}

  @Post('checkout')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'Check out an item to a borrower',
    description: 'R04: The desk assistant hands an item to a borrower; the system records the borrower and the due date.',
  })
  @ApiResponse({ status: 201, description: 'Loan created' })
  @ApiResponse({ status: 400, description: 'Invalid input, past due date, or in-house-only item', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role, inactive borrower, or no safety briefing', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Borrower or item not found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Item not available', type: ErrorResponseDto })
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: any) {
    return this.service.checkout(dto, user);
  }

  @Post(':id/checkin')
  @HttpCode(200)
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'Check in a returned item',
    description: 'R05: The desk assistant takes an item back and records its condition.',
  })
  @ApiResponse({ status: 200, description: 'Loan returned' })
  @ApiResponse({ status: 400, description: 'Invalid input', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Loan not found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Loan already returned', type: ErrorResponseDto })
  checkin(@Param('id') id: string, @Body() dto: CheckinDto, @CurrentUser() user: any) {
    return this.service.checkin(id, dto, user);
  }

  @Get('borrowers')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({ summary: 'List active borrowers', description: 'R04: Lets the desk assistant pick the borrower for a check-out.' })
  @ApiResponse({ status: 200, description: 'Active borrowers' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  findBorrowers() {
    return this.service.findBorrowers();
  }

  @Get('available-equipment')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({ summary: 'List items that can be checked out', description: 'R04: Lets the desk assistant pick the item for a check-out.' })
  @ApiResponse({ status: 200, description: 'Take-home items that are available or reserved' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  findCheckoutEquipment() {
    return this.service.findCheckoutEquipment();
  }

  @Get('active')
  @Roles(Role.DESK_ASSISTANT, Role.MANAGER)
  @ApiOperation({
    summary: 'List loans currently out',
    description: 'R06: The desk assistant sees which items are out, with whom, and when they are due.',
  })
  @ApiResponse({ status: 200, description: 'Active and overdue loans' })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Wrong role', type: ErrorResponseDto })
  findActive() {
    return this.service.findActive();
  }
}
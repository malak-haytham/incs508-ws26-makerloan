import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ErrorResponseDto } from '../../common/error-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { MyReservationDto, ReservationDto } from './dto/responses.dto';
import { F1AvailabilityReservationsService } from './f1-availability-reservations.service';

/** F1 — reservations by borrowers (students, staff, lecturers). Requirement R02. */
@ApiTags('F1 Availability & Reservations')
@ApiCookieAuth('access_token')
@Roles(Role.STUDENT, Role.STAFF, Role.LECTURER)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly service: F1AvailabilityReservationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Reserve an item for a future day',
    description:
      'R02 (FR): an authenticated borrower reserves an item for one future calendar day, if the item is not checked out and has no active reservation for that day. ' +
      '401 if not logged in, 403 for desk/manager roles, 400 for a non-future date or an item that is not available, 409 if the item is already reserved for that day.',
  })
  @ApiResponse({ status: 201, type: ReservationDto })
  @ApiResponse({ status: 400, description: 'Invalid input, non-future date, retired or checked-out item', type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Equipment not found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Item already reserved for that day', type: ErrorResponseDto })
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: any) {
    return this.service.createReservation(String(user._id), dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List my reservations', description: 'Supports R02: authenticated borrower only.' })
  @ApiResponse({ status: 200, type: [MyReservationDto] })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  mine(@CurrentUser() user: any) {
    return this.service.myReservations(String(user._id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel my reservation', description: 'Supports R02: a borrower can cancel only their own active reservation.' })
  @ApiResponse({ status: 200, type: ReservationDto })
  @ApiResponse({ status: 400, description: 'Invalid id or reservation not active', type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Not your reservation', type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.cancelReservation(String(user._id), id);
  }
}
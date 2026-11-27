import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/error-response.dto';
import { SearchAvailabilityResponseDto } from './dto/responses.dto';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import { F1AvailabilityReservationsService } from './f1-availability-reservations.service';

/** F1 — requirements R01–R03 — Owner: Member 1 */
@ApiTags('F1 Availability & Reservations')
@ApiCookieAuth('access_token')
@Controller('availability')
export class F1AvailabilityReservationsController {
  constructor(private readonly service: F1AvailabilityReservationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Search equipment and see availability status',
    description:
      'R01 (FR): borrowers search the catalogue by item name or category and see each item\'s availability status (Available, Reserved or Checked Out, as defined in BR-01). ' +
      'R03 (NFR): the response includes tookMs, the time spent on the search, to check the 2-second target. ' +
      'Requires a logged-in user (cookie login); unauthenticated calls get 401.',
  })
  @ApiResponse({ status: 200, type: SearchAvailabilityResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid query parameter', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Not logged in', type: ErrorResponseDto })
  async search(@Query() query: SearchAvailabilityDto): Promise<SearchAvailabilityResponseDto> {
    const started = Date.now();
    const items = await this.service.search(query);
    return { items, count: items.length, tookMs: Date.now() - started };
  }
}
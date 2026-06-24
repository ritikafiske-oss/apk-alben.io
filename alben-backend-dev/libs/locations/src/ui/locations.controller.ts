import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ChangeStatusService } from '../application/change-status.service';
import { SyncLocationsService } from '../application/sync-locations.service';
import { ChangeStatusRequestDto } from './dtos/change-status.request.dto';
import { ChangeStatusResponseDto } from './dtos/change-status.response.dto';
import {
  SyncLocationItemDto,
  SyncLocationsResponseDto,
} from './dtos/sync-locations.request.dto';
import { JwtAuthGuard, User, ExceptionHandler } from '@libs/common';

/**
 * Locations Controller
 *
 * Provides the public API for user activity status changes.
 * Handles authentication extraction and delegates business logic to ChangeStatusService.
 */
@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly changeStatusService: ChangeStatusService,
    private readonly syncLocationsService: SyncLocationsService,
  ) {}

  @Post('change-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user activity status (Check In/Out)' })
  @ApiResponse({ status: 200, type: ChangeStatusResponseDto })
  async changeStatus(
    @User() user: { id: number },
    @Body() dto: ChangeStatusRequestDto,
  ): Promise<ChangeStatusResponseDto> {
    try {
      const userId = Number(user.id);
      return await this.changeStatusService.execute(userId, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('bulk-sync')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sync location data in bulk' })
  @ApiResponse({ status: 200, type: SyncLocationsResponseDto })
  @ApiBody({ type: [SyncLocationItemDto] })
  async bulkSync(
    @User() user: { id: number },
    @Body() dto: SyncLocationItemDto[],
  ): Promise<SyncLocationsResponseDto> {
    try {
      const userId = Number(user.id);
      return await this.syncLocationsService.execute(userId, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

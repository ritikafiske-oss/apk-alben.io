import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, User, ExceptionHandler } from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { ContactStatusService } from '../application/contact-status.service';
import { GetContactStatusesDto } from './dtos/get-contact-statuses.dto';

@ApiTags('Contact Status')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('contacts') // Keeping existing route for backward compatibility if needed, or change to 'contact-statuses'
export class ContactStatusController {
  constructor(private readonly contactStatusService: ContactStatusService) {}

  @Get('statuses')
  @ApiOperation({ summary: 'Get contact statuses' })
  async getContactStatuses(
    @User() user: { id: number },
    @Query() query: GetContactStatusesDto,
  ) {
    try {
      return await this.contactStatusService.getContactStatuses(
        user.id,
        query.company_id,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

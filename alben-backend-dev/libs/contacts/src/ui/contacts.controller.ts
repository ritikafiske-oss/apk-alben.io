import { Controller, UseGuards, Body, Post, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  User,
  ApiResponse as ApiResponseDto,
  ExceptionHandler,
} from '@libs/common';
import { ActiveCompanyGuard, SkipActiveCompanyGuard } from '@libs/users';
import { ContactService } from '../application/contact.service';
import { CheckContactDto } from './dtos/check-contact.dto';
import { GetContactsDto } from './dtos/get-contacts.dto';
import { GetContactsResponseDto } from './dtos/get-contacts-response.dto';
import { GetContactDetailsDto } from './dtos/get-contact-details.dto';
import { GetContactDetailsResponseDto } from './dtos/get-contact-details-response.dto';
import { CreateContactRequestDto } from './dtos/create-contact.dto';
import { UpdateContactRequestDto } from './dtos/update-contact.dto';
import { CreateContactUseCase } from '../application/create-contact.usecase';
import { UpdateContactUseCase } from '../application/update-contact.usecase';
import {
  SaveBulkCallLogRequestDto,
  SaveBulkCallLogsDataDto,
} from './dtos/save-bulk-call-log.dto';
import { SaveBulkCallLogUseCase } from '../application/save-bulk-call-log.usecase';
import { SaveCallLogDetailsUseCase } from '../application/save-call-log-details.usecase';
import { UpdateCallLogRecordingUseCase } from '../application/update-call-log-recording.usecase';
import { SaveCallLogDetailsRequestDto } from './dtos/save-call-log-details.dto';
import { UpdateCallLogRecordingRequestDto } from './dtos/update-call-log-recording.dto';
import { GetCallLogsDto } from './dtos/get-call-logs.dto';
import { GetCallLogsUseCase } from '../application/get-call-logs.usecase';
import { UploadAttachmentsUseCase } from '../application/upload-attachments.usecase';
import { GetContactCountsUseCase } from '../application/get-contact-counts.usecase';
import { ContactCountsResponseDto } from './dtos/get-contact-counts-response.dto';
import { GetContactCountsQueryDto } from './dtos/get-contact-counts-query.dto';
import { UploadAttachmentsDto } from './dtos/upload-attachments.dto';
import { GetActionDetailsUseCase } from '../application/get-action-details.usecase';
import { GetActionDetailsQueryDto } from './dtos/get-action-details-query.dto';
import { GetActionRecentsUseCase } from '../application/get-action-recents.usecase';
import { GetActionRecentsQueryDto } from './dtos/get-action-recents-query.dto';
import { MarkMyPlanRequestDto } from './dtos/mark-my-plan.dto';
import { MarkMyPlanUseCase } from '../application/mark-my-plan.usecase';
import { UnmarkMyPlanRequestDto } from './dtos/unmark-my-plan.dto';
import { UnmarkMyPlanUseCase } from '../application/unmark-my-plan.usecase';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactService: ContactService,
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly saveBulkCallLogUseCase: SaveBulkCallLogUseCase,
    private readonly saveCallLogDetailsUseCase: SaveCallLogDetailsUseCase,
    private readonly updateCallLogRecordingUseCase: UpdateCallLogRecordingUseCase,
    private readonly getCallLogsUseCase: GetCallLogsUseCase,
    private readonly uploadAttachmentsUseCase: UploadAttachmentsUseCase,
    private readonly getContactCountsUseCase: GetContactCountsUseCase,
    private readonly getActionDetailsUseCase: GetActionDetailsUseCase,
    private readonly getActionRecentsUseCase: GetActionRecentsUseCase,
    private readonly markMyPlanUseCase: MarkMyPlanUseCase,
    private readonly unmarkMyPlanUseCase: UnmarkMyPlanUseCase,
  ) {}

  @Post('check')
  @ApiOperation({ summary: 'Check if contact exists or is excluded' })
  async checkContact(
    @User() user: { id: number },
    @Body() dto: CheckContactDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.contactService.checkContact(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with filtering' })
  @ApiOkResponse({
    description: 'Contacts fetched successfully.',
    type: GetContactsResponseDto,
  })
  async getContacts(
    @User() user: { id: number },
    @Query() dto: GetContactsDto,
  ): Promise<ApiResponseDto<GetContactsResponseDto>> {
    try {
      return await this.contactService.getContacts(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('info')
  @ApiOperation({ summary: 'Get detailed info of a specific contact' })
  @ApiOkResponse({
    description: 'Contact details fetched successfully.',
    type: GetContactDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid contact or product.',
  })
  async getContactDetails(
    @User() user: { id: number },
    @Query() dto: GetContactDetailsDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.contactService.getContactDetails(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('call-logs')
  @ApiOperation({ summary: 'Get call logs with filtering' })
  @ApiOkResponse({
    description: 'Logs fetched successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid company or product.',
  })
  @ApiOperation({ summary: 'Get call logs with filtering' })
  async getCallLogs(
    @User() user: { id: number },
    @Query() dto: GetCallLogsDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.getCallLogsUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new contact(s)' })
  @ApiOkResponse({
    description: 'Contact saved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or invalid references.',
  })
  async createContact(
    @User() user: { id: number },
    @Body() dto: CreateContactRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.createContactUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('update')
  @ApiOperation({ summary: 'Update an existing contact' })
  @ApiOkResponse({
    description: 'Contact updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or invalid references.',
  })
  async updateContact(
    @User() user: { id: number },
    @Body() dto: UpdateContactRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.updateContactUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('call-logs/bulk')
  @ApiOperation({ summary: 'Save bulk call log data' })
  @ApiOkResponse({
    description: 'Details saved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or invalid requirements.',
  })
  @ApiBody({ type: SaveBulkCallLogRequestDto })
  @ApiOkResponse({
    description: 'Details saved successfully.',
    type: SaveBulkCallLogsDataDto,
  })
  async saveBulkCallLogs(
    @User() user: { id: number },
    @Body() dto: SaveBulkCallLogRequestDto,
  ): Promise<ApiResponseDto<SaveBulkCallLogsDataDto>> {
    try {
      return await this.saveBulkCallLogUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('call-logs/details')
  @SkipActiveCompanyGuard()
  @ApiOperation({ summary: 'Save product details for a call log' })
  @ApiBody({ type: SaveCallLogDetailsRequestDto })
  @ApiOkResponse({ description: 'Details saved successfully.' })
  async saveCallLogDetails(
    @User() user: { id: number },
    @Body() dto: SaveCallLogDetailsRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.saveCallLogDetailsUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('call-logs/recording')
  @SkipActiveCompanyGuard()
  @ApiOperation({ summary: 'Update recording URL for a call log' })
  @ApiBody({ type: UpdateCallLogRecordingRequestDto })
  @ApiOkResponse({ description: 'Recording updated successfully.' })
  async updateCallLogRecording(
    @User() user: { id: number },
    @Body() dto: UpdateCallLogRecordingRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.updateCallLogRecordingUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('upload-attachments')
  @ApiOperation({ summary: 'Upload attachments for a contact' })
  async uploadAttachments(
    @Body() dto: UploadAttachmentsDto,
    @User() user: { id: number },
  ) {
    try {
      return await this.uploadAttachmentsUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('actions/count')
  @ApiOperation({ summary: 'Get counts for my plan, new, reminder, overdue' })
  @ApiExtraModels(ApiResponseDto, ContactCountsResponseDto)
  @ApiOkResponse({
    description: 'Counts fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(ContactCountsResponseDto) },
          },
        },
      ],
    },
  })
  async getContactCounts(
    @Query() query: GetContactCountsQueryDto,
    @User() user: { id: number },
  ): Promise<ApiResponseDto<ContactCountsResponseDto>> {
    try {
      return await this.getContactCountsUseCase.execute(
        user.id,
        query.company_id,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('actions/details')
  @ApiOperation({ summary: 'Get contact details based on action type' })
  @ApiExtraModels(ApiResponseDto, GetContactsResponseDto)
  @ApiOkResponse({
    description: 'Action details fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetContactsResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid action type or parameters.' })
  async getActionDetails(
    @Query() query: GetActionDetailsQueryDto,
    @User() user: { id: number },
  ): Promise<ApiResponseDto<GetContactsResponseDto>> {
    try {
      return await this.getActionDetailsUseCase.execute(user.id, query);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('actions/recents')
  @ApiOperation({ summary: 'Get recent actions (calls, reminders, visits)' })
  @ApiExtraModels(ApiResponseDto, GetContactsResponseDto)
  @ApiOkResponse({
    description: 'Recent actions fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetContactsResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid parameters.' })
  async getActionRecents(
    @Query() query: GetActionRecentsQueryDto,
    @User() user: { id: number },
  ): Promise<ApiResponseDto<GetContactsResponseDto>> {
    try {
      return await this.getActionRecentsUseCase.execute(user.id, query);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('actions/mark-my-plan')
  @ApiOperation({
    summary: 'Mark contacts or notes as part of My Plan',
    description:
      'Uses call_or_note_id as id and data_from as type from the action details response.',
  })
  @ApiBody({ type: MarkMyPlanRequestDto })
  @ApiExtraModels(ApiResponseDto)
  @ApiOkResponse({
    description: 'Items marked successfully.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ApiResponseDto) }],
    },
  })
  @ApiQuery({ name: 'company_id', required: true, type: Number })
  async markMyPlan(
    @Body() dto: MarkMyPlanRequestDto,
    @User() user: { id: number },
    @Query('company_id') companyId: number,
  ): Promise<ApiResponseDto<null>> {
    try {
      return await this.markMyPlanUseCase.execute(user.id, dto, companyId);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('actions/unmark-my-plan')
  @ApiOperation({
    summary: 'Unmark contacts or notes from My Plan',
    description:
      'Uses call_or_note_id as id and data_from as type from the action details response.',
  })
  @ApiBody({ type: UnmarkMyPlanRequestDto })
  @ApiExtraModels(ApiResponseDto)
  @ApiOkResponse({
    description: 'Items unmarked successfully.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ApiResponseDto) }],
    },
  })
  @ApiQuery({ name: 'company_id', required: true, type: Number })
  async unmarkMyPlan(
    @Body() dto: UnmarkMyPlanRequestDto,
    @User() user: { id: number },
    @Query('company_id') companyId: number,
  ): Promise<ApiResponseDto<null>> {
    try {
      return await this.unmarkMyPlanUseCase.execute(user.id, dto, companyId);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

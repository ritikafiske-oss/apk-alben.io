import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  ApiResponse,
  User,
  ExceptionHandler,
} from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { GetVisitTypesUseCase } from '../application/get-visit-types.usecase';
import { GetVisitLogsUseCase } from '../application/get-visit-logs.usecase';
import { GetVisitLogDetailsUseCase } from '../application/get-visit-log-details.usecase';
import { SaveVisitLogUseCase } from '../application/save-visit-log.usecase';
import { SaveSurpriseVisitUseCase } from '../application/save-surprise-visit.usecase';
import { LocationChangeRequestUseCase } from '../application/location-change-request.usecase';
import { CreateVisitLogDto } from './dtos/create-visit-log.dto';
import { GetVisitLogsDto } from './dtos/get-visit-logs.dto';
import { GetVisitLogDetailsDto } from './dtos/get-visit-log-details.dto';
import { GetVisitTypesDto } from './dtos/get-visit-types.dto';
import { SaveSurpriseVisitDto } from './dtos/save-surprise-visit.dto';
import { LocationChangeRequestDto } from './dtos/location-change-request.dto';
import { VisitLogDetails } from '../interfaces/visit-log-details.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiExtraModels,
  ApiBody,
  getSchemaPath,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  SaveVisitLogResponse,
  GetVisitTypesResponse,
  GetVisitLogsResponse,
} from './dtos/visit-response.dto';
import { GetVisitLogDetailsResponseData } from './dtos/get-visit-log-details-response.dto';

@ApiTags('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly getVisitTypesUseCase: GetVisitTypesUseCase,
    private readonly getVisitLogsUseCase: GetVisitLogsUseCase,
    private readonly getVisitLogDetailsUseCase: GetVisitLogDetailsUseCase,
    private readonly saveVisitLogUseCase: SaveVisitLogUseCase,
    private readonly saveSurpriseVisitUseCase: SaveSurpriseVisitUseCase,
    private readonly locationChangeRequestUseCase: LocationChangeRequestUseCase,
  ) {}

  @Get('get-visit-types')
  @ApiOperation({
    summary: 'Get visit types',
    description: 'Fetches all available visit types for a given company.',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Visit types fetched successfully.',
    type: GetVisitTypesResponse,
  })
  async getVisitTypes(
    @Query() query: GetVisitTypesDto,
    @User() user: { id: number },
  ): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await this.getVisitTypesUseCase.execute(
        query.company_id,
        user.id,
      );

      const data = response.map((vt) => ({
        id: Number(vt.id),
        name: vt.name,
        is_next_followup: vt.isNextFollowup ? 1 : 0,
        color_code: vt.colorCode,
      }));

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: data,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('get-visit-logs')
  @ApiOperation({
    summary: 'Get visit logs',
    description:
      'Fetches paginated visit logs for a specific company and product.',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Visit logs fetched successfully.',
    type: GetVisitLogsResponse,
  })
  async getVisitLogs(
    @Query() query: GetVisitLogsDto,
    @User() user: { id: number },
  ): Promise<
    ApiResponse<{
      current_page: number;
      total_pages: number;
      total_items: number;
      records: Array<
        Record<
          | 'id'
          | 'photo'
          | 'remark'
          | 'datetime'
          | 'latitude'
          | 'longitude'
          | 'visit_type_id'
          | 'contact_id'
          | 'product_id'
          | 'user_id'
          | 'created_at'
          | 'change_request_location_status'
          | 'approved_rejected_remark'
          | 'change_request_location_user_remark'
          | 'visitType'
          | 'contact',
          unknown
        >
      >;
    }>
  > {
    try {
      const result = await this.getVisitLogsUseCase.execute(
        query.company_id,
        query.product_id,
        user.id,
        (query.page as number) || 1,
        (query.limit as number) || 200,
        query.visit_type_id,
      );

      const limit = query.limit || 200;
      const responseData = {
        current_page: Number(query.page),
        total_pages: Math.ceil(result.total / limit),
        total_items: result.total,
        records: result.items.map((item) => ({
          id: item.id,
          photo: item.photo,
          remark: item.remark,
          datetime: item.datetime,
          latitude: item.latitude,
          longitude: item.longitude,
          visit_type_id: item.visitTypeId,
          contact_id: item.contactId,
          product_id: item.productId,
          user_id: item.userId,
          created_at: item.createdAt,
          change_request_location_status: item.changeRequestLocationStatus,
          approved_rejected_remark: item.approvedRejectedRemark,
          change_request_location_user_remark:
            item.changeRequestLocationUserRemark,
          visitType: item.visitType,
          contact: item.contact,
        })),
      };

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: responseData,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('get-visit-log-details')
  @ApiOperation({
    summary: 'Get visit log details by ID',
    description:
      'Fetches detailed information for a specific visit, including multi-product details and notes.',
  })
  @ApiExtraModels(ApiResponse, GetVisitLogDetailsResponseData)
  @SwaggerApiResponse({
    status: 200,
    description: 'Visit details fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetVisitLogDetailsResponseData) },
          },
        },
      ],
    },
  })
  async getVisitLogDetails(
    @Query() query: GetVisitLogDetailsDto,
    @User() user: { id: number },
  ): Promise<ApiResponse<unknown>> {
    try {
      const data: VisitLogDetails =
        await this.getVisitLogDetailsUseCase.execute(
          query.company_id,
          user.id,
          query.visit_log_id,
        );

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: data,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('save-visit-log')
  @ApiOperation({
    summary: 'Save visit log',
    description:
      'Creates a new visit log with multiple visit items. Each visit item can contain multiple products pitched to the contact. A separate note and reminder is automatically created for every linked product in the pitch. The system strictly enforces product-contact linking.',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Visit created successfully.',
    type: SaveVisitLogResponse,
  })
  async saveVisitLog(
    @Body() body: CreateVisitLogDto,
    @User() user: { id: number },
  ): Promise<ApiResponse<null>> {
    try {
      await this.saveVisitLogUseCase.execute(user.id, body);
      return {
        success: true,
        code: 'VISIT_CREATED',
        message: 'Visit created successfully.',
        data: null,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('save-surprise-visit')
  @ApiOperation({
    summary: 'Save surprise visit',
    description: 'Submits an answer and location for a surprise visit task.',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Task submitted successfully.',
    type: SaveVisitLogResponse,
  })
  async saveSurpriseVisit(
    @Body() body: SaveSurpriseVisitDto,
    @User() user: { id: number },
  ): Promise<ApiResponse<null>> {
    try {
      await this.saveSurpriseVisitUseCase.execute(
        body.company_id,
        user.id,
        body.question_id,
        body.answer,
        body.latitude,
        body.longitude,
      );
      return {
        success: true,
        code: 'VISIT_TASK_SUBMITTED',
        message: 'Task submitted successfully.',
        data: null,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('location-change-request')
  @ApiOperation({
    summary: 'Location change request',
    description: 'Submit a batch of location change requests for visits.',
  })
  @ApiBody({ type: [LocationChangeRequestDto] })
  @ApiExtraModels(ApiResponse)
  @SwaggerApiResponse({
    status: 201,
    description: 'Location change request submitted successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            code: {
              type: 'string',
              example: 'LOCATION_CHANGE_REQUEST_SUBMITTED',
            },
            message: {
              type: 'string',
              example: 'Location change request submitted successfully.',
            },
            data: { type: 'null', example: null },
          },
        },
      ],
    },
  })
  async locationChangeRequest(
    @Body() body: LocationChangeRequestDto[],
    @User() user: { id: number },
  ): Promise<ApiResponse<null>> {
    try {
      await this.locationChangeRequestUseCase.execute(user.id, body);
      return {
        success: true,
        code: 'LOCATION_CHANGE_REQUEST_SUBMITTED',
        message: 'Location change request submitted successfully.',
        data: null,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  User,
  ApiResponse,
  ExceptionHandler,
} from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';
import { DashboardMetricsResponseDto } from './dtos/dashboard-metrics.response.dto';
import { GetDashboardMetricsQueryDto } from './dtos/get-dashboard-metrics-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get overall dashboard metrics statistics' })
  @ApiExtraModels(ApiResponse, DashboardMetricsResponseDto)
  @SwaggerApiResponse({
    status: 200,
    description: 'Dashboard metrics fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(DashboardMetricsResponseDto) },
          },
        },
      ],
    },
  })
  async getMetrics(
    @User() user: { id: number },
    @Query() query: GetDashboardMetricsQueryDto,
  ): Promise<ApiResponse<DashboardMetricsResponseDto>> {
    try {
      return await this.getDashboardMetricsUseCase.execute(
        user.id,
        query.company_id,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

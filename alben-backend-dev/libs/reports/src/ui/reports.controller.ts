import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  User,
  ApiResponse as ApiResponseDto,
} from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { GetReportsQueryDto } from './dtos/get-reports-query.dto';
import { GetCallReportsUseCase } from '../application/get-call-reports.usecase';
import { GetVisitReportsUseCase } from '../application/get-visit-reports.usecase';
import { GetAttendanceReportUseCase } from '../application/get-attendance-report.usecase';
import { CallReportDataDto } from './dtos/call-report-response.dto';
import { VisitReportDataDto } from './dtos/visit-report-response.dto';
import { GetAttendanceReportQueryDto } from './dtos/get-attendance-report-query.dto';
import {
  AttendanceReportDataDto,
  GetAttendanceReportResponseDto,
} from './dtos/attendance-report-response.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly getCallReportsUseCase: GetCallReportsUseCase,
    private readonly getVisitReportsUseCase: GetVisitReportsUseCase,
    private readonly getAttendanceReportUseCase: GetAttendanceReportUseCase,
  ) {}

  @Get('calls')
  @ApiOperation({ summary: 'Get call log statistics' })
  @ApiOkResponse({ description: 'Call report data fetched successfully.' })
  async getCallReports(
    @User() user: { id: number },
    @Query() query: GetReportsQueryDto,
  ): Promise<ApiResponseDto<CallReportDataDto>> {
    return await this.getCallReportsUseCase.execute(user.id, query);
  }

  @Get('visits')
  @ApiOperation({ summary: 'Get visit log statistics' })
  @ApiOkResponse({ description: 'Visit report data fetched successfully.' })
  async getVisitReports(
    @User() user: { id: number },
    @Query() query: GetReportsQueryDto,
  ): Promise<ApiResponseDto<VisitReportDataDto>> {
    return await this.getVisitReportsUseCase.execute(user.id, query);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get user attendance report' })
  @ApiOkResponse({
    description: 'Attendance report data fetched successfully.',
    type: GetAttendanceReportResponseDto,
  })
  async getAttendanceReport(
    @User() user: { id: number },
    @Query() query: GetAttendanceReportQueryDto,
  ): Promise<ApiResponseDto<AttendanceReportDataDto>> {
    return await this.getAttendanceReportUseCase.execute(user.id, query);
  }
}

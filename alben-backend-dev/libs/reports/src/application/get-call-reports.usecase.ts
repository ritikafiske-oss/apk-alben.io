import { Injectable, Inject } from '@nestjs/common';
import { GetReportsQueryDto } from '../ui/dtos/get-reports-query.dto';
import type { ReportsRepositoryPort } from '../domain/ports/reports.repository.port';
import { UserService } from '@libs/users';
import { ReportDateHelper } from './report-date.helper';
import { ApiResponse } from '@libs/common';
import { CallReportDataDto } from '../ui/dtos/call-report-response.dto';

export const REPORTS_REPOSITORY = 'ReportsRepositoryPort';

@Injectable()
export class GetCallReportsUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepo: ReportsRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    query: GetReportsQueryDto,
  ): Promise<ApiResponse<CallReportDataDto>> {
    const { company_id, filter_by, start_date, end_date } = query;

    // 1. Validate user and company
    await this.userService.validateUserCompany(userId, company_id);

    // 2. Resolve date range
    const { startDate, endDate } = ReportDateHelper.getStartAndEndDates(
      filter_by,
      start_date,
      end_date,
    );

    // 3. Fetch stats
    const {
      stats,
      totalCalls,
      totalDurationSeconds,
      totalProductDetailsCount,
    } = await this.reportsRepo.getCallLogStats(
      userId,
      query,
      startDate,
      endDate,
    );

    // 4. Format total duration
    const totalMinutes = Math.floor(totalDurationSeconds / 60);
    const remainingSeconds = totalDurationSeconds % 60;
    const formattedTotalDuration = `${totalMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Report data fetched successfully.',
      data: {
        total_calls: totalCalls,
        total_duration: formattedTotalDuration,
        total_call_log_product_details_count: totalProductDetailsCount,
        contact_statuses: stats,
      },
    };
  }
}

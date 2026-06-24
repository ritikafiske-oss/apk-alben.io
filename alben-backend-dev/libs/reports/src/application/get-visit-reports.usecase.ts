import { Injectable, Inject } from '@nestjs/common';
import { GetReportsQueryDto } from '../ui/dtos/get-reports-query.dto';
import type { ReportsRepositoryPort } from '../domain/ports/reports.repository.port';
import { UserService } from '@libs/users';
import { ReportDateHelper } from './report-date.helper';
import { DistanceService } from '../domain/distance.service';
import { ApiResponse } from '@libs/common';
import { VisitReportDataDto } from '../ui/dtos/visit-report-response.dto';

export const REPORTS_REPOSITORY = 'ReportsRepositoryPort';

@Injectable()
export class GetVisitReportsUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepo: ReportsRepositoryPort,
    private readonly userService: UserService,
    private readonly distanceService: DistanceService,
  ) {}

  async execute(
    userId: number,
    query: GetReportsQueryDto,
  ): Promise<ApiResponse<VisitReportDataDto>> {
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
    const { stats, totalVisits, totalProductDetailsCount } =
      await this.reportsRepo.getVisitLogStats(
        userId,
        query,
        startDate,
        endDate,
      );

    // 4. Fetch location logs for distance calculation
    const locationLogs = await this.reportsRepo.getLocationLogs(
      userId,
      company_id,
      startDate,
      endDate,
    );

    // 5. Calculate total distance
    const totalDistance =
      this.distanceService.calculateTotalDistance(locationLogs);

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Report data fetched successfully.',
      data: {
        total_visits: totalVisits,
        total_travelling_distance: `${totalDistance} km`,
        total_visit_log_product_details_count: totalProductDetailsCount,
        visit_types: stats,
      },
    };
  }
}

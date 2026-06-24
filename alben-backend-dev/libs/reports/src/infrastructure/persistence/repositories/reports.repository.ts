import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ReportsRepositoryPort,
  CallLogStat,
  VisitLogStat,
  LocationLogRow,
  AttendanceLogRow,
} from '../../../domain/ports/reports.repository.port';
import { GetReportsQueryDto } from '../../../ui/dtos/get-reports-query.dto';

@Injectable()
export class ReportsRepository implements ReportsRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async getCallLogStats(
    userId: number,
    query: GetReportsQueryDto,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    stats: CallLogStat[];
    totalCalls: number;
    totalDurationSeconds: number;
    totalProductDetailsCount: number;
  }> {
    const { company_id, product_id } = query;

    // 1. Get Global Call Totals
    let globalCallSql = `
      SELECT 
        COUNT(cl.id) as total_calls, 
        SUM(COALESCE(CAST(cl.duration AS UNSIGNED), 0)) as total_duration_seconds
      FROM call_logs cl
      JOIN contacts c ON cl.contact_id = c.id
      WHERE cl.user_id = ? AND c.company_id = ? AND cl.created_at BETWEEN ? AND ?
    `;
    const globalCallParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      globalCallSql += ` AND EXISTS (SELECT 1 FROM call_log_product_details clpd WHERE clpd.call_log_id = cl.id AND clpd.product_id = ?)`;
      globalCallParams.push(Number(product_id));
    }

    const [globalCallResult] = await this.dataSource.query<
      { total_calls: string; total_duration_seconds: string }[]
    >(globalCallSql, globalCallParams);

    // 2. Get Total Unique (Client + Product) Pairs Count
    let uniqueProductSql = `
      SELECT COUNT(DISTINCT cl.contact_id, clpd.product_id) as count
      FROM call_log_product_details clpd
      JOIN call_logs cl ON clpd.call_log_id = cl.id
      JOIN contacts c ON cl.contact_id = c.id
      WHERE cl.user_id = ? AND c.company_id = ? AND cl.created_at BETWEEN ? AND ?
    `;
    const uniqueProductParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      uniqueProductSql += ` AND clpd.product_id = ?`;
      uniqueProductParams.push(Number(product_id));
    }

    const [uniqueProductResult] = await this.dataSource.query<
      { count: string }[]
    >(uniqueProductSql, uniqueProductParams);
    const totalProductDetailsCount = Number(uniqueProductResult?.count || 0);

    // 3. Get Product Status Breakdown
    let statusBreakdownSql = `
      SELECT 
        cs.id as status_id,
        cs.name as contact_status, 
        cs.color_code, 
        COALESCE(t.product_count, 0) as total
      FROM contact_statuses cs
      LEFT JOIN (
        SELECT status_id, COUNT(*) as product_count
        FROM (
          SELECT clpd.status_id, 
                 ROW_NUMBER() OVER(PARTITION BY cl.contact_id, clpd.product_id ORDER BY cl.created_at DESC, clpd.id DESC) as rn
          FROM call_log_product_details clpd
          JOIN call_logs cl ON clpd.call_log_id = cl.id
          JOIN contacts c ON cl.contact_id = c.id
          WHERE cl.user_id = ? AND c.company_id = ? AND cl.created_at BETWEEN ? AND ?
    `;
    const statusBreakdownParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      statusBreakdownSql += ` AND clpd.product_id = ?`;
      statusBreakdownParams.push(Number(product_id));
    }

    statusBreakdownSql += `
        ) inner_t
        WHERE rn = 1
        GROUP BY status_id
      ) t ON cs.id = t.status_id
      WHERE cs.company_id = ? AND cs.deleted_at IS NULL
      ORDER BY total DESC, cs.name ASC
    `;
    statusBreakdownParams.push(company_id);

    const statusResults = await this.dataSource.query<
      { contact_status: string; color_code: string; total: string }[]
    >(statusBreakdownSql, statusBreakdownParams);

    const stats = statusResults.map((row) => ({
      contact_status: row.contact_status,
      total: Number(row.total),
      color_code: row.color_code || '#000000',
      percentage:
        totalProductDetailsCount > 0
          ? Number(
              ((Number(row.total) / totalProductDetailsCount) * 100).toFixed(2),
            )
          : 0,
    }));

    return {
      stats,
      totalCalls: Number(globalCallResult?.total_calls || 0),
      totalDurationSeconds: Number(
        globalCallResult?.total_duration_seconds || 0,
      ),
      totalProductDetailsCount,
    };
  }

  async getVisitLogStats(
    userId: number,
    query: GetReportsQueryDto,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    stats: VisitLogStat[];
    totalVisits: number;
    totalProductDetailsCount: number;
  }> {
    const { company_id, product_id } = query;

    // 1. Get Global Visit Totals
    let globalVisitSql = `
      SELECT COUNT(vl.id) as total_visits
      FROM visit_logs vl
      JOIN contacts c ON vl.contact_id = c.id
      WHERE vl.user_id = ? AND c.company_id = ? AND vl.created_at BETWEEN ? AND ?
    `;
    const globalVisitParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      globalVisitSql += ` AND EXISTS (SELECT 1 FROM visit_log_product_details vlpd WHERE vlpd.visit_log_id = vl.id AND vlpd.product_id = ?)`;
      globalVisitParams.push(Number(product_id));
    }

    const [globalVisitResult] = await this.dataSource.query<
      { total_visits: string }[]
    >(globalVisitSql, globalVisitParams);

    // 2. Get Total Unique (Client + Product) Pairs Count for Visits
    let uniqueProductSql = `
      SELECT COUNT(DISTINCT vl.contact_id, vlpd.product_id) as count
      FROM visit_log_product_details vlpd
      JOIN visit_logs vl ON vlpd.visit_log_id = vl.id
      JOIN contacts c ON vl.contact_id = c.id
      WHERE vl.user_id = ? AND c.company_id = ? AND vl.created_at BETWEEN ? AND ?
    `;
    const uniqueProductParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      uniqueProductSql += ` AND vlpd.product_id = ?`;
      uniqueProductParams.push(Number(product_id));
    }

    const [uniqueProductResult] = await this.dataSource.query<
      { count: string }[]
    >(uniqueProductSql, uniqueProductParams);
    const totalProductDetailsCount = Number(uniqueProductResult?.count || 0);

    // 3. Get Visit Type Breakdown (Products)
    let visitBreakdownSql = `
      SELECT 
        vt.id as visit_type_id,
        vt.name as visit_type, 
        vt.color_code, 
        COALESCE(t.product_count, 0) as total
      FROM visit_types vt
      LEFT JOIN (
        SELECT visit_type_id, COUNT(*) as product_count
        FROM (
          SELECT vlpd.visit_type_id, 
                 ROW_NUMBER() OVER(PARTITION BY vl.contact_id, vlpd.product_id ORDER BY vl.created_at DESC, vlpd.id DESC) as rn
          FROM visit_log_product_details vlpd
          JOIN visit_logs vl ON vlpd.visit_log_id = vl.id
          JOIN contacts c ON vl.contact_id = c.id
          WHERE vl.user_id = ? AND c.company_id = ? AND vl.created_at BETWEEN ? AND ?
    `;
    const visitBreakdownParams: (string | number | Date)[] = [
      userId,
      company_id,
      startDate,
      endDate,
    ];

    if (product_id && product_id !== 'all') {
      visitBreakdownSql += ` AND vlpd.product_id = ?`;
      visitBreakdownParams.push(Number(product_id));
    }

    visitBreakdownSql += `
        ) inner_t
        WHERE rn = 1
        GROUP BY visit_type_id
      ) t ON vt.id = t.visit_type_id
      WHERE vt.company_id = ? AND vt.deleted_at IS NULL
      ORDER BY total DESC, vt.name ASC
    `;
    visitBreakdownParams.push(company_id);

    const visitResults = await this.dataSource.query<
      { visit_type: string; color_code: string; total: string }[]
    >(visitBreakdownSql, visitBreakdownParams);

    const stats = visitResults.map((row) => ({
      visit_type: row.visit_type,
      total: Number(row.total),
      color_code: row.color_code || '#000000',
      percentage:
        totalProductDetailsCount > 0
          ? Number(
              ((Number(row.total) / totalProductDetailsCount) * 100).toFixed(2),
            )
          : 0,
    }));

    return {
      stats,
      totalVisits: Number(globalVisitResult?.total_visits || 0),
      totalProductDetailsCount,
    };
  }

  async getLocationLogs(
    userId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<LocationLogRow[]> {
    const sql = `
      SELECT log_type, latitude, longitude, created_at
      FROM location_logs
      WHERE user_id = ? AND company_id = ? 
        AND created_at BETWEEN ? AND ?
        AND latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude != 0 AND longitude != 0
        AND log_type NOT IN ('call', 'note')
      ORDER BY created_at ASC
    `;

    const params = [userId, companyId, startDate, endDate];
    return await this.dataSource.query(sql, params);
  }

  async getAttendanceLogs(
    userId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceLogRow[]> {
    const sql = `
      SELECT 
        shift_date as date,
        MIN(buffer_hours) as buffer_hours,
        MIN(shift_start_datetime) as shift_start_datetime,
        MIN(shift_end_datetime) as shift_end_datetime,
        GROUP_CONCAT(CASE WHEN activity_status = 'Check In' THEN CONCAT('checkIn_', created_at) ELSE NULL END SEPARATOR ', ') AS check_in_timestamps,
        GROUP_CONCAT(CASE WHEN activity_status = 'Check Out' THEN CONCAT('checkOut_', created_at) ELSE NULL END SEPARATOR ', ') AS check_out_timestamps,
        MIN(latitude) as latitude,
        MIN(longitude) as longitude
      FROM user_logs
      WHERE user_id = ? AND company_id = ? 
        AND shift_date BETWEEN ? AND ?
      GROUP BY shift_date
      HAVING COUNT(DISTINCT shift_start_datetime) = 1
         AND COUNT(DISTINCT shift_end_datetime) = 1
      ORDER BY shift_date DESC
    `;

    const params = [userId, companyId, startDate, endDate];
    return await this.dataSource.query<AttendanceLogRow[]>(sql, params);
  }
}

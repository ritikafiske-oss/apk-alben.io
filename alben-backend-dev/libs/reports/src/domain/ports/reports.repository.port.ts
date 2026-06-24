import { GetReportsQueryDto } from '../../ui/dtos/get-reports-query.dto';

export interface CallLogStat {
  contact_status: string;
  total: number;
  color_code: string;
  percentage: number;
}

export interface VisitLogStat {
  visit_type: string;
  total: number;
  color_code: string;
  percentage: number;
}

export interface LocationLogRow {
  log_type: string;
  latitude: number;
  longitude: number;
  created_at: Date;
}

export interface ReportsRepositoryPort {
  getCallLogStats(
    userId: number,
    query: GetReportsQueryDto,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    stats: CallLogStat[];
    totalCalls: number;
    totalDurationSeconds: number;
    totalProductDetailsCount: number;
  }>;

  getVisitLogStats(
    userId: number,
    query: GetReportsQueryDto,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    stats: VisitLogStat[];
    totalVisits: number;
    totalProductDetailsCount: number;
  }>;

  getLocationLogs(
    userId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<LocationLogRow[]>;

  getAttendanceLogs(
    userId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceLogRow[]>;
}

export interface AttendanceLogRow {
  date: string;
  buffer_hours: number;
  shift_start_datetime: string;
  shift_end_datetime: string;
  check_in_timestamps: string | null;
  check_out_timestamps: string | null;
  latitude: number;
  longitude: number;
}

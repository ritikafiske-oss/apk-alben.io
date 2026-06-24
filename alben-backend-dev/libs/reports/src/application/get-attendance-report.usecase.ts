import { Injectable, Inject } from '@nestjs/common';
import { GetAttendanceReportQueryDto } from '../ui/dtos/get-attendance-report-query.dto';
import {
  AttendanceReportDataDto,
  AttendanceRecordDto,
} from '../ui/dtos/attendance-report-response.dto';
import type { ReportsRepositoryPort } from '../domain/ports/reports.repository.port';
import { UserService } from '@libs/users';
import { ApiResponse, DateUtil } from '@libs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

export const REPORTS_REPOSITORY = 'ReportsRepositoryPort';

@Injectable()
export class GetAttendanceReportUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepo: ReportsRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    query: GetAttendanceReportQueryDto,
  ): Promise<ApiResponse<AttendanceReportDataDto>> {
    const { company_id, start_date, end_date, page = 1, limit = 200 } = query;

    // 1. Validate user and company
    const userCompany = await this.userService.validateUserCompany(
      userId,
      company_id,
    );

    try {
      const now = dayjs().tz('Asia/Kolkata');

      // 2. Resolve date range
      // Default display range (last month)
      const defaultStart = now.subtract(1, 'month').startOf('month');
      const defaultEnd = now.subtract(1, 'month').endOf('month');

      const queryStartDate = start_date
        ? dayjs.utc(start_date).startOf('day')
        : defaultStart;
      const queryEndDate = end_date
        ? dayjs.utc(end_date).endOf('day')
        : defaultEnd;

      // Calculate fetch range to satisfy both query and summary stats
      // Stats need: Today, Current Week (Mon), Current Month (1st), Last Month (1st)
      const lastMonthStart = now.subtract(1, 'month').startOf('month');
      const fetchStart = queryStartDate.isBefore(lastMonthStart)
        ? queryStartDate
        : lastMonthStart;
      const fetchEnd = queryEndDate.isAfter(now) ? queryEndDate : now;

      // 3. Fetch raw records from repository
      const records = await this.reportsRepo.getAttendanceLogs(
        userId,
        company_id,
        fetchStart.toDate(),
        fetchEnd.toDate(),
      );

      const processedRecords: AttendanceRecordDto[] = [];

      for (const record of records) {
        const shiftStartTime = record.shift_start_datetime;
        const shiftEndTime = record.shift_end_datetime;

        // Calculate adjusted shift times with buffer
        // Laravel: $adjustedShiftStartTime = Carbon::parse($shiftStartTime)->subMinutes($record->buffer_hours * 60)->format('Y-m-d H:i:s');
        const adjustedShiftStartTime = dayjs
          .utc(shiftStartTime)
          .subtract(record.buffer_hours * 60, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        const adjustedShiftEndTime = dayjs
          .utc(shiftEndTime)
          .add(record.buffer_hours * 60, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');

        // Combine and filter timestamps
        const combinedTimestamps = [
          ...(record.check_in_timestamps
            ? record.check_in_timestamps.split(', ')
            : []),
          ...(record.check_out_timestamps
            ? record.check_out_timestamps.split(', ')
            : []),
        ];

        const filterResult = this.filterCheckInOutTimestamps(
          combinedTimestamps,
          adjustedShiftStartTime,
          adjustedShiftEndTime,
          false,
        );

        if (!filterResult.isValidTimestamp) {
          continue;
        }

        const firstLastTimestamps = this.getFirstLastTimestamps(
          filterResult.filteredTimestamps,
          adjustedShiftEndTime,
        );

        const workHourSummary = this.calculateWorkingHours(
          filterResult.timestampPairs,
          shiftStartTime,
          shiftEndTime,
          adjustedShiftStartTime,
          adjustedShiftEndTime,
        );

        // Format check-in time
        let checkInTime: string | null = null;
        if (firstLastTimestamps.firstCheckIn) {
          checkInTime = DateUtil.getDateTimeAccordingTimezone(
            firstLastTimestamps.firstCheckIn,
            'UTC',
            'Asia/Kolkata',
            'hh:mm A',
          );
        }

        // Format check-out time
        let checkOutTime: string | null = null;
        if (
          firstLastTimestamps.lastCheckOut !== '-' &&
          firstLastTimestamps.lastCheckOut
        ) {
          checkOutTime = DateUtil.getDateTimeAccordingTimezone(
            firstLastTimestamps.lastCheckOut,
            'UTC',
            'Asia/Kolkata',
            'hh:mm A',
          );
        }

        const totalMinutes = this.convertTimeToMinutes(
          workHourSummary.totalWorkHours,
        );

        processedRecords.push({
          user_id: userId,
          company_id: company_id,
          date: dayjs.utc(record.date).format('YYYY-MM-DD'),
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          total_hours: workHourSummary.totalWorkHours,
          total_minutes: totalMinutes,
          total_hours_in_seconds: workHourSummary.rawTotalWorkHours,
          latitude: record.latitude,
          longitude: record.longitude,
        });
      }

      // 4. Filter records for display list
      const displayRecords = processedRecords.filter((record) => {
        const recordDate = dayjs.utc(record.date);
        return (
          recordDate.isSameOrAfter(queryStartDate) &&
          recordDate.isSameOrBefore(queryEndDate)
        );
      });

      // 5. Paginate display records
      const totalItems = displayRecords.length;
      const totalPages = Math.ceil(totalItems / limit);
      const offset = (page - 1) * limit;
      const paginatedRecords = displayRecords.slice(offset, offset + limit);

      // 6. Calculate summary statistics (from all processed records)
      const today = now.startOf('day');
      const startCurrentWeek = now.startOf('isoWeek');
      const endCurrentWeek = now.endOf('isoWeek');
      const startCurrentMonth = now.startOf('month');
      const endCurrentMonth = now.endOf('month');
      const startLastMonth = now.subtract(1, 'month').startOf('month');
      const endLastMonth = now.subtract(1, 'month').endOf('month');

      const todayHr = this.calculateTotalHoursFromRecords(
        processedRecords,
        today.format('YYYY-MM-DD'),
      );
      const currentWeekHr = this.calculateTotalHoursFromRecordsRange(
        processedRecords,
        startCurrentWeek,
        endCurrentWeek,
      );
      const currentMonthHr = this.calculateTotalHoursFromRecordsRange(
        processedRecords,
        startCurrentMonth,
        endCurrentMonth,
      );
      const lastMonthHr = this.calculateTotalHoursFromRecordsRange(
        processedRecords,
        startLastMonth,
        endLastMonth,
      );

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Fetched attendance records.',
        data: {
          today_hr: todayHr,
          current_week_hr: currentWeekHr,
          current_month_hr: currentMonthHr,
          last_month_hr: lastMonthHr,
          current_status: userCompany?.activityStatus || null,
          current_page: page,
          total_pages: totalPages,
          total_items: totalItems,
          records: paginatedRecords,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        code: 'FETCH_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Error fetching attendance records.',
        data: null as unknown as AttendanceReportDataDto,
      };
    }
  }

  private filterCheckInOutTimestamps(
    combinedTimestamps: string[],
    adjustedShiftStartTime: string,
    adjustedShiftEndTime: string,
    convertTimestamp = true,
  ) {
    const allTimestamps = combinedTimestamps
      .filter((ts) => ts && ts.includes('_'))
      .map((ts) => {
        const [status, time] = ts.split('_');
        let finalTime: string;
        if (convertTimestamp) {
          finalTime = DateUtil.getDateTimeAccordingTimezone(
            time,
            'UTC',
            'Asia/Kolkata',
            'YYYY-MM-DD HH:mm:ss',
          );
        } else {
          finalTime = dayjs(time).format('YYYY-MM-DD HH:mm:ss');
        }
        return { status, time: finalTime };
      })
      .sort((a, b) => dayjs(a.time).unix() - dayjs(b.time).unix());

    const start = dayjs.utc(adjustedShiftStartTime);
    const end = dayjs.utc(adjustedShiftEndTime);

    const filteredTimestamps = allTimestamps.filter((ts) => {
      const t = dayjs.utc(ts.time);
      return t.isSameOrAfter(start) && t.isSameOrBefore(end);
    });

    const isValidTimestampArray =
      filteredTimestamps.length > 0 &&
      filteredTimestamps.some((ts) => ts.status === 'checkIn');

    const timestampPairs: string[] = [];
    if (isValidTimestampArray) {
      let i = 0;
      while (i < filteredTimestamps.length) {
        const current = filteredTimestamps[i];
        if (current.status === 'checkIn') {
          if (
            i + 1 < filteredTimestamps.length &&
            filteredTimestamps[i + 1].status === 'checkOut'
          ) {
            timestampPairs.push(
              `${current.status}_${current.time}=${filteredTimestamps[i + 1].status}_${filteredTimestamps[i + 1].time}`,
            );
            i += 2;
          } else {
            if (i === filteredTimestamps.length - 1) {
              timestampPairs.push(`${current.status}_${current.time}=@`);
            }
            i++;
          }
        } else {
          i++;
        }
      }
    }

    return {
      isValidTimestamp: isValidTimestampArray,
      timestampPairs,
      filteredTimestamps: filteredTimestamps.map(
        (ts) => `${ts.status}_${ts.time}`,
      ),
    };
  }

  private getFirstLastTimestamps(
    filteredTimestamps: string[],
    adjustedShiftEndTime: string,
  ) {
    let firstCheckIn: string | null = null;
    let lastCheckOut: string | null = null;
    let effectiveCheckOut: string | null = null;

    for (const ts of filteredTimestamps) {
      if (ts.startsWith('checkIn_')) {
        firstCheckIn = ts.split('_')[1];
        break;
      }
    }

    if (filteredTimestamps.length > 0) {
      const lastTs = filteredTimestamps[filteredTimestamps.length - 1];
      if (lastTs.startsWith('checkIn_')) {
        lastCheckOut = '-';
        const now = dayjs.utc();
        const adjEnd = dayjs.utc(adjustedShiftEndTime);

        if (now.isBefore(adjEnd)) {
          effectiveCheckOut = now.format('YYYY-MM-DD HH:mm:ss');
        } else {
          effectiveCheckOut = adjustedShiftEndTime;
        }
      } else {
        for (let i = filteredTimestamps.length - 1; i >= 0; i--) {
          if (filteredTimestamps[i].startsWith('checkOut_')) {
            lastCheckOut = filteredTimestamps[i].split('_')[1];
            break;
          }
        }
        effectiveCheckOut = '-';
      }
    }

    return { firstCheckIn, lastCheckOut, effectiveCheckOut };
  }

  private calculateWorkingHours(
    timestampPairs: string[],
    shiftStartTime: string,
    shiftEndTime: string,
    adjustedShiftStartTime: string,
    adjustedShiftEndTime: string,
  ) {
    let totalTime = 0;
    let earlyLoginTime = 0;
    let lateLoginTime = 0;
    let earlyLogoutTime = 0;
    let overTime = 0;
    let workInProgress = false;

    const shiftStart = dayjs.utc(shiftStartTime);
    const shiftEnd = dayjs.utc(shiftEndTime);
    const adjShiftEnd = dayjs.utc(adjustedShiftEndTime);
    const now = dayjs.utc();

    const lastIndex = timestampPairs.length - 1;

    for (let index = 0; index < timestampPairs.length; index++) {
      const pair = timestampPairs[index];
      const [start, end] = pair.split('=');
      const startTimeStr = start.split('_')[1];
      const startTime = dayjs.utc(startTimeStr);

      if (index === 0) {
        if (startTime.isBefore(shiftStart)) {
          earlyLoginTime = shiftStart.diff(startTime, 'second');
        } else if (startTime.isAfter(shiftStart)) {
          lateLoginTime = startTime.diff(shiftStart, 'second');
        }
      }

      if (end === '@') {
        if (now.isSameOrBefore(adjShiftEnd)) {
          totalTime += now.diff(startTime, 'second');
          workInProgress = true;
        } else {
          totalTime += adjShiftEnd.diff(startTime, 'second');
          if (adjShiftEnd.isAfter(shiftEnd)) {
            overTime = adjShiftEnd.diff(shiftEnd, 'second');
          }
        }
        continue;
      }

      const endTimeStr = end.split('_')[1];
      const endTime = dayjs.utc(endTimeStr);

      totalTime += endTime.diff(startTime, 'second');

      if (index === lastIndex) {
        if (endTime.isAfter(shiftEnd)) {
          overTime = endTime.diff(shiftEnd, 'second');
        } else if (endTime.isBefore(shiftEnd) && now.isSameOrAfter(shiftEnd)) {
          earlyLogoutTime = shiftEnd.diff(endTime, 'second');
        }
      }
    }

    return this.convertSecondsToTimeFormat(
      totalTime,
      earlyLoginTime,
      lateLoginTime,
      earlyLogoutTime,
      overTime,
      workInProgress,
    );
  }

  private convertSecondsToTimeFormat(
    totalWorkTime: number,
    earlyLoginTime: number,
    lateLoginTime: number,
    earlyLogoutTime: number,
    overTime: number,
    workInProgress: boolean,
  ) {
    const convert = (seconds: number) => {
      if (seconds === 0) return '00:00';
      const totalMinutes = Math.floor(seconds / 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      totalWorkHours: convert(totalWorkTime),
      earlyLoginTime: convert(earlyLoginTime),
      lateLoginTime: convert(lateLoginTime),
      earlyLogoutTime: convert(earlyLogoutTime),
      overTime: convert(overTime),
      workInProgress,
      rawTotalWorkHours: totalWorkTime,
    };
  }

  private convertTimeToMinutes(timeString: string) {
    if (!timeString || timeString === '00:00') return 0;
    const [h, m] = timeString.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  private calculateTotalHoursFromRecords(
    records: AttendanceRecordDto[],
    date: string,
  ) {
    let totalMinutes = 0;
    for (const record of records) {
      if (record.date === date) {
        totalMinutes += record.total_minutes;
      }
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private calculateTotalHoursFromRecordsRange(
    records: AttendanceRecordDto[],
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
  ) {
    let totalSeconds = 0;
    for (const record of records) {
      const recordDate = dayjs.tz(record.date, 'Asia/Kolkata');
      if (
        recordDate.isSameOrAfter(startDate) &&
        recordDate.isSameOrBefore(endDate)
      ) {
        totalSeconds += record.total_hours_in_seconds;
      }
    }
    if (totalSeconds === 0) return '00:00';
    const totalMinutes = Math.floor(totalSeconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

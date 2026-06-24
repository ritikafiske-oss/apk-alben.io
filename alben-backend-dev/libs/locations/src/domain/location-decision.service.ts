import { Injectable } from '@nestjs/common';
import { UserLog } from './user-log.entity';
import { JobLocation } from './job-location.entity';
import { ShiftDetails } from '../interfaces/shift-details.interface';
import { DynamicLoggerService } from '@libs/common';
import { ShiftScheduleEntity } from '../infrastructure/persistence/entities/shift-schedule.entity';
import dayjs from 'dayjs';

/**
 * Payload passed to calculateShiftDetails representing the three consecutive day schedules.
 * Each field maps to the raw ShiftScheduleEntity row (or null if missing / holiday).
 */
export interface ShiftSchedulesInput {
  yesterday: ShiftScheduleEntity | null;
  today: ShiftScheduleEntity | null;
  tomorrow: ShiftScheduleEntity | null;
  yesterdayDate: string; // 'YYYY-MM-DD'
  todayDate: string;
  tomorrowDate: string;
  now: Date;
}

@Injectable()
export class LocationDecisionService {
  constructor(private readonly logger?: DynamicLoggerService) {}

  // ---------------------------------------------------------------------------
  // getShiftDetails (translated from Laravel ShiftAttendanceHelper::getShiftDetails)
  // ---------------------------------------------------------------------------

  /**
   * Determines which shift is currently active for the user and calculates all
   * relevant datetime stamps including buffer-adjusted windows.
   */
  public calculateShiftDetails(input: ShiftSchedulesInput): ShiftDetails {
    const defaultResult: ShiftDetails = {
      shift_date: null,
      shift_start_datetime: null,
      shift_end_datetime: null,
      adjusted_start_datetime: null,
      adjusted_end_datetime: null,
      is_holiday: 0,
      buffer_hours: 0,
      shift_day: null,
      is_shift_ongoing: false,
      shift_start_time: null,
      shift_end_time: null,
    };

    const {
      yesterday,
      today,
      tomorrow,
      yesterdayDate,
      todayDate,
      tomorrowDate,
      now,
    } = input;

    if (!yesterday || !today || !tomorrow) {
      return defaultResult;
    }

    // 1. All three days are holidays
    if (
      yesterday.is_holiday === 1 &&
      today.is_holiday === 1 &&
      tomorrow.is_holiday === 1
    ) {
      return { ...defaultResult, is_holiday: 1, is_shift_ongoing: false };
    }

    const yesterdayBuffer = Number(yesterday.buffer_hours ?? 0);
    const tomorrowBuffer = Number(tomorrow.buffer_hours ?? 0);

    // 2. Yesterday's adjusted window
    const adjYesterdayStart = dayjs(`${yesterdayDate} ${yesterday.start_time}`)
      .subtract(yesterdayBuffer * 60, 'minute')
      .toDate();
    let adjYesterdayEnd = dayjs(`${yesterdayDate} ${yesterday.end_time}`)
      .add(yesterdayBuffer * 60, 'minute')
      .toDate();
    // Night shift: end_time < start_time -> shifts ends next day
    if (yesterday.end_time < yesterday.start_time) {
      adjYesterdayEnd = dayjs(adjYesterdayEnd).add(1, 'day').toDate();
    }

    // 3. Tomorrow's adjusted window
    const adjTomorrowStart = dayjs(`${tomorrowDate} ${tomorrow.start_time}`)
      .subtract(tomorrowBuffer * 60, 'minute')
      .toDate();
    let adjTomorrowEnd = dayjs(`${tomorrowDate} ${tomorrow.end_time}`)
      .add(tomorrowBuffer * 60, 'minute')
      .toDate();
    // Night shift: end_time < start_time -> shifts ends next day (day after tomorrow)
    if (tomorrow.end_time < tomorrow.start_time) {
      adjTomorrowEnd = dayjs(adjTomorrowEnd).add(1, 'day').toDate();
    }

    // 4. Priority resolution
    let schedule: ShiftScheduleEntity | null = null;
    let selectedDate: string | null = null;

    if (
      yesterday.is_holiday !== 1 &&
      now >= adjYesterdayStart &&
      now <= adjYesterdayEnd
    ) {
      schedule = yesterday;
      selectedDate = yesterdayDate;
    } else if (
      tomorrow.is_holiday !== 1 &&
      now >= adjTomorrowStart &&
      now < adjTomorrowEnd
    ) {
      schedule = tomorrow;
      selectedDate = tomorrowDate;
    } else if (today.is_holiday !== 1 && now > adjYesterdayEnd) {
      schedule = today;
      selectedDate = todayDate;
    }

    if (!schedule || !selectedDate) {
      return { ...defaultResult, is_holiday: 1, is_shift_ongoing: false };
    }

    const { start_time, end_time, is_holiday, buffer_hours, day } = schedule;

    if (!start_time || !end_time || is_holiday === 1) {
      return defaultResult;
    }

    const bufferHours = Number(buffer_hours ?? 0);
    const shiftStart = dayjs(`${selectedDate} ${start_time}`);
    let shiftEnd = dayjs(`${selectedDate} ${end_time}`);

    // Night shift: end < start
    if (end_time < start_time) {
      shiftEnd = shiftEnd.add(1, 'day');
    }

    const adjStart = shiftStart.subtract(bufferHours * 60, 'minute');
    const adjEnd = shiftEnd.add(bufferHours * 60, 'minute');

    const isShiftOngoing = now >= adjStart.toDate() && now <= adjEnd.toDate();

    const format = 'YYYY-MM-DD HH:mm:ss';
    return {
      shift_date: selectedDate,
      shift_start_datetime: shiftStart.format(format),
      shift_end_datetime: shiftEnd.format(format),
      adjusted_start_datetime: adjStart.format(format),
      adjusted_end_datetime: adjEnd.format(format),
      is_holiday: 0,
      buffer_hours: bufferHours,
      shift_day: day,
      is_shift_ongoing: isShiftOngoing,
      shift_start_time: start_time,
      shift_end_time: end_time,
    };
  }

  // ---------------------------------------------------------------------------
  // shouldCreatePastCheckout
  // ---------------------------------------------------------------------------

  public shouldCreatePastCheckout(
    lastLog: UserLog,
    currentTime: Date,
  ): boolean {
    if (!lastLog || lastLog.activityStatus !== 'Check In') return false;
    if (!lastLog.shiftEndDatetime) return false;

    const shiftEnd = dayjs(lastLog.shiftEndDatetime);
    const bufferMins = Math.max(0, Number(lastLog.bufferHours) * 60 - 2);
    const adjustedShiftEnd = shiftEnd.add(bufferMins, 'minute');

    return dayjs(currentTime).isAfter(adjustedShiftEnd);
  }

  public getAutoCheckoutTimestamp(lastLog: UserLog): Date {
    const shiftEnd = dayjs(lastLog.shiftEndDatetime);
    const bufferMins = Math.max(0, Number(lastLog.bufferHours) * 60 - 2);
    return shiftEnd.add(bufferMins, 'minute').toDate();
  }

  // ---------------------------------------------------------------------------
  // isWithinLocation (Geofencing)
  // ---------------------------------------------------------------------------

  public isWithinLocation(
    currentLat: number,
    currentLong: number,
    jobLocation: JobLocation,
  ): boolean {
    if (!jobLocation) return false;

    const distance = this.calculateDistance(
      currentLat,
      currentLong,
      jobLocation.latitude,
      jobLocation.longitude,
    );

    const radiusInMeters = Number(jobLocation.radius) * 1000;

    if (this.logger) {
      this.logger.error(
        `Geofence Check: User[${currentLat}, ${currentLong}] vs Location[${jobLocation.latitude}, ${jobLocation.longitude}]. Distance: ${distance}m, Allowed Radius: ${radiusInMeters}m (${jobLocation.radius}km)`,
        'OUT_OF_RANGE_DEBUG',
        'locations',
      );
    }

    return distance <= radiusInMeters;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

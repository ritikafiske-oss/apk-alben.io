import { Injectable, Inject } from '@nestjs/common';
import {
  LocationDecisionService,
  ShiftSchedulesInput,
} from '../domain/location-decision.service';
import type { LocationsRepositoryPort } from '../domain/ports/locations.repository.port';
import { ChangeStatusRequestDto } from '../ui/dtos/change-status.request.dto';
import { ChangeStatusResponseDto } from '../ui/dtos/change-status.response.dto';
import { UserService } from '@libs/users';
import { DynamicLoggerService, DateUtil } from '@libs/common';
import { LOCATIONS_REPOSITORY } from '../domain/ports/locations.repository.port';
import { ShiftScheduleEntity } from '../infrastructure/persistence/entities/shift-schedule.entity';
import dayjs from 'dayjs';

/**
 * Change Status Service
 *
 * Orchestrates the "Check In" and "Check Out" workflow for users.
 * This service handles company validation, status synchronization across companies,
 * shift-based auto-checkout, and logging of activity transitions.
 */
@Injectable()
export class ChangeStatusService {
  constructor(
    @Inject(LOCATIONS_REPOSITORY)
    private readonly repository: LocationsRepositoryPort,
    private readonly decisionService: LocationDecisionService,
    private readonly userService: UserService,
    private readonly logger: DynamicLoggerService,
  ) {}

  /**
   * Executes the status change workflow.
   *
   * @flow Workflow Steps:
   * 1. Centralized company access check (via UserService).
   * 2. Auto-Checkout: Closes any previous shift that exceeded its time+buffer window.
   * 3. Sync: Ensures user is checked out of all other companies if checking into a new one.
   * 4. Redundancy: Returns early if the user is already in the requested status.
   * 5. Logging: Calculates shift/location context and creates a new UserLog.
   * 6. State: Updates the official activity_status in the user_companies association.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Request payload containing status, company, and GPS.
   * @returns Promise<ChangeStatusResponseDto>
   */
  async execute(
    userId: number,
    dto: ChangeStatusRequestDto,
  ): Promise<ChangeStatusResponseDto> {
    const { activity_status, company_id, latitude = 0, longitude = 0 } = dto;

    // this.logger.error(
    //   `ChangeStatus Triggered: User ${userId}, Company ${company_id}, Status ${activity_status}, Lat ${latitude}, Lng ${longitude}`,
    //   'CHANGE_STATUS_DEBUG',
    //   'locations',
    // );

    // 1. Verify Company Access
    const userCompany = await this.userService.validateUserCompany(
      userId,
      company_id,
    );

    // 2. Early Redundancy Guard (Primary)
    // Matches Laravel's check against currently stored activity_status
    // if (
    //   activity_status === 'Check Out' &&
    //   userCompany.activityStatus === 'Check Out'
    // ) {
    //   return {
    //     success: true,
    //     code: 'CHECK_OUT_REDUNDANT',
    //     message: `${activity_status} successfully.`,
    //     data: null,
    //   };
    // }

    // Matches Laravel: Carbon::parse(CommonHelper::getDateTimeAccordingTimezone(Carbon::now('UTC')))
    const currentTime = DateUtil.getDateTimeAccordingTimezone(new Date());

    // 2. Handle Auto-Checkout for Past Shifts
    const lastLog = await this.repository.findLastLog(userId, company_id);
    let isPastCheckOutEntryCreated = false;

    if (
      lastLog &&
      this.decisionService.shouldCreatePastCheckout(lastLog, currentTime)
    ) {
      const jobLocation = await this.repository.findUserJobLocation(
        userId,
        company_id,
      );

      // B2 fix: Use the adjusted shift-end time as createdAt
      const autoCheckoutCreatedAt =
        this.decisionService.getAutoCheckoutTimestamp(lastLog);

      const userLog = await this.repository.createUserLog({
        userId,
        companyId: company_id,
        activityStatus: 'Check Out',
        latitude: lastLog.latitude,
        longitude: lastLog.longitude,
        shiftStartTime: lastLog.shiftStartTime,
        shiftEndTime: lastLog.shiftEndTime,
        shiftStartDatetime: lastLog.shiftStartDatetime,
        shiftEndDatetime: lastLog.shiftEndDatetime,
        userJobLocationLatitude: jobLocation?.latitude || 0,
        userJobLocationLongitude: jobLocation?.longitude || 0,
        userJobLocationRadius: Number(jobLocation?.radius || 0),
        shiftDate: lastLog.shiftDate,
        isHoliday: lastLog.isHoliday,
        bufferHours: lastLog.bufferHours,
        createdAt: autoCheckoutCreatedAt,
      });

      if (lastLog.latitude !== 0 && lastLog.longitude !== 0) {
        await this.repository.createLocationLog({
          user_log_id: userLog.id,
          user_id: userId,
          company_id: company_id,
          log_type: 'check_out',
          latitude: lastLog.latitude,
          longitude: lastLog.longitude,
          user_job_location_latitude: jobLocation?.latitude || 0,
          user_job_location_longitude: jobLocation?.longitude || 0,
          user_job_location_radius: Number(jobLocation?.radius || 0),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      await this.repository.updateUserCompanyStatus(
        userId,
        company_id,
        'Check Out',
      );

      isPastCheckOutEntryCreated = true;
    }

    // 4. Status Synchronization (Laravel Style - DB Update Only)
    if (activity_status === 'Check In') {
      await this.repository.checkoutAllOtherCompanies(userId, company_id);
    } else if (activity_status === 'Check Out') {
      await this.repository.checkoutAllCompanies(userId);
    }

    // 5. Get Shift Details
    // B5 fix: Use shiftId from the user-company association retrieved in Step 1.
    const shiftDetails = await this.resolveShiftDetails(
      userCompany.shiftId,
      currentTime,
    );

    // 6. Get Job Location
    const jobLocation = await this.repository.findUserJobLocation(
      userId,
      company_id,
    );

    // 7. Geofencing Check (Only for Check In)
    // if (activity_status === 'Check In' && jobLocation) {
    //   this.decisionService.isWithinLocation(
    //     latitude,
    //     longitude,
    //     jobLocation,
    //   );
    // }

    // 8. Create Final Entry
    // Laravel Logic: Skip if we just created a past checkout and current request is Checkout
    if (
      !isPastCheckOutEntryCreated ||
      activity_status === 'Check In' ||
      (activity_status === 'Check Out' && !isPastCheckOutEntryCreated)
    ) {
      const userLog = await this.repository.createUserLog({
        userId,
        companyId: company_id,
        activityStatus: activity_status,
        latitude,
        longitude,
        shiftStartTime: shiftDetails.shift_start_time,
        shiftEndTime: shiftDetails.shift_end_time,
        shiftStartDatetime: shiftDetails.shift_start_datetime,
        shiftEndDatetime: shiftDetails.shift_end_datetime,
        userJobLocationLatitude: jobLocation?.latitude || 0,
        userJobLocationLongitude: jobLocation?.longitude || 0,
        userJobLocationRadius: Number(jobLocation?.radius || 0),
        shiftDate: shiftDetails.shift_date,
        isHoliday: shiftDetails.is_holiday,
        bufferHours: shiftDetails.buffer_hours,
      });

      if (latitude !== 0 && longitude !== 0) {
        await this.repository.createLocationLog({
          user_log_id: userLog.id,
          user_id: userId,
          company_id: company_id,
          log_type: activity_status === 'Check In' ? 'check_in' : 'check_out',
          latitude,
          longitude,
          user_job_location_latitude: jobLocation?.latitude || 0,
          user_job_location_longitude: jobLocation?.longitude || 0,
          user_job_location_radius: Number(jobLocation?.radius || 0),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await this.repository.updateUserCompanyStatus(
      userId,
      company_id,
      activity_status,
    );

    return {
      success: true,
      code:
        activity_status === 'Check In'
          ? 'CHECK_IN_SUCCESS'
          : 'CHECK_OUT_SUCCESS',
      message: `${activity_status} successfully.`,
      data: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Fetches the three day-of-week shift schedules (yesterday/today/tomorrow)
   * for the given shiftId and delegates calculation to LocationDecisionService.
   *
   * When shiftId is null (user not assigned to a shift), returns all-null defaults.
   */
  private async resolveShiftDetails(shiftId: number | null, now: Date) {
    const defaultShift = {
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

    if (!shiftId) return defaultShift;

    const today = dayjs(now);
    const yesterday = today.subtract(1, 'day');
    const tomorrow = today.add(1, 'day');

    const yesterdayDate = yesterday.format('YYYY-MM-DD');
    const todayDate = today.format('YYYY-MM-DD');
    const tomorrowDate = tomorrow.format('YYYY-MM-DD');

    const getDayName = (d: dayjs.Dayjs) => d.format('dddd');
    const dYesterday = getDayName(yesterday);
    const dToday = getDayName(today);
    const dTomorrow = getDayName(tomorrow);

    const days = [...new Set([dYesterday, dToday, dTomorrow])];
    const schedules = await this.repository.findShiftSchedulesByDays(
      shiftId,
      days,
    );

    const find = (dayName: string): ShiftScheduleEntity | null =>
      schedules.find((s) => s.day === dayName) ?? null;

    const input: ShiftSchedulesInput = {
      yesterday: find(dYesterday),
      today: find(dToday),
      tomorrow: find(dTomorrow),
      yesterdayDate,
      todayDate,
      tomorrowDate,
      now,
    };

    return this.decisionService.calculateShiftDetails(input);
  }
}

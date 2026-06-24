import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LocationsRepositoryPort } from '../../domain/ports/locations.repository.port';
import { UserLog } from '../../domain/user-log.entity';
import { JobLocation } from '../../domain/job-location.entity';
import { UserLogEntity } from './entities/user-log.entity';
import { JobLocationEntity } from './entities/job-location.entity';
import { LocationLogEntity } from './entities/location-log.entity';
import { UserJobLocationEntity } from './entities/user-job-location.entity';
import { ShiftScheduleEntity } from './entities/shift-schedule.entity';

/**
 * TypeORM Implementation of Locations Repository
 *
 * Handles all database persistence for the Locations module.
 * Manages User Logs and Job Locations while interacting with user_companies via raw SQL
 * to maintain module isolation per hexagonal architecture rules.
 */
@Injectable()
export class LocationsRepository implements LocationsRepositoryPort {
  constructor(
    @InjectRepository(UserLogEntity)
    private readonly logRepository: Repository<UserLogEntity>,
    @InjectRepository(JobLocationEntity)
    private readonly jobLocationRepository: Repository<JobLocationEntity>,
    @InjectRepository(LocationLogEntity)
    private readonly locationLogRepository: Repository<LocationLogEntity>,
    @InjectRepository(UserJobLocationEntity)
    private readonly userJobLocationRepository: Repository<UserJobLocationEntity>,
    @InjectRepository(ShiftScheduleEntity)
    private readonly shiftScheduleRepository: Repository<ShiftScheduleEntity>,
  ) {}

  /**
   * Retrieves the most recent log for a user at a specific company.
   * Used to determine current activity status and check for redundant transitions.
   */
  async findLastLog(
    userId: number,
    companyId: number,
  ): Promise<UserLog | null> {
    const log = await this.logRepository.findOne({
      where: { user_id: userId, company_id: companyId },
      order: { created_at: 'DESC', id: 'DESC' },
    });
    return log ? this.mapToDomain(log) : null;
  }

  /**
   * Finds the job location assigned to the user for a specific company.
   * Queries via the user_job_locations junction table, mirroring the Laravel:
   *   UserJobLocation::with('jobLocation')->where('user_id',...)
   *     ->whereHas('jobLocation', fn($q) => $q->where('company_id',...)->where('status','active'))
   *     ->first();
   */
  async findUserJobLocation(
    userId: number,
    companyId: number,
  ): Promise<JobLocation | null> {
    const userJobLoc = await this.userJobLocationRepository.findOne({
      where: {
        user_id: userId,
        jobLocation: {
          company_id: companyId,
          status: 'active',
        },
      },
      relations: ['jobLocation'],
    });

    const jobLoc = userJobLoc?.jobLocation ?? null;
    return jobLoc
      ? new JobLocation(
          jobLoc.id,
          jobLoc.company_id,
          jobLoc.name,
          jobLoc.address,
          Number(jobLoc.latitude),
          Number(jobLoc.longitude),
          jobLoc.radius,
          jobLoc.created_by,
          jobLoc.status,
          jobLoc.created_at,
          jobLoc.updated_at,
          jobLoc.deleted_at,
        )
      : null;
  }

  /**
   * Persists a new user activity log entry to the database.
   * Maps domain entity fields to the snake_case columns required by the schema.
   */
  async createUserLog(data: Partial<UserLog>): Promise<UserLog> {
    const logEntity = new UserLogEntity();
    logEntity.user_id = data.userId!;
    logEntity.company_id = data.companyId!;
    logEntity.activity_status = data.activityStatus!;
    logEntity.latitude = data.latitude ?? 0;
    logEntity.longitude = data.longitude ?? 0;
    logEntity.shift_start_time = data.shiftStartTime!;
    logEntity.shift_end_time = data.shiftEndTime!;
    logEntity.shift_start_datetime = data.shiftStartDatetime!;
    logEntity.shift_end_datetime = data.shiftEndDatetime!;
    logEntity.user_job_location_latitude = data.userJobLocationLatitude ?? 0;
    logEntity.user_job_location_longitude = data.userJobLocationLongitude ?? 0;
    logEntity.user_job_location_radius = data.userJobLocationRadius ?? 0;
    logEntity.shift_date = data.shiftDate!;
    logEntity.is_holiday = data.isHoliday ?? 0;
    logEntity.buffer_hours = data.bufferHours ?? 3.0;
    logEntity.day_off_id = data.dayOffId!;
    logEntity.created_at = data.createdAt ?? new Date();

    const saved = await this.logRepository.save(logEntity);
    return this.mapToDomain(saved);
  }

  /**
   * Updates the user's status in the user_companies junction table.
   * Uses raw SQL because user_companies is externally managed by the Users module.
   */
  async updateUserCompanyStatus(
    userId: number,
    companyId: number,
    status: string,
  ): Promise<void> {
    await this.logRepository.query(
      'UPDATE user_companies SET activity_status = ? WHERE user_id = ? AND company_id = ?',
      [status, userId, companyId],
    );
  }

  async checkoutAllOtherCompanies(
    userId: number,
    currentCompanyId: number,
  ): Promise<void> {
    await this.logRepository.query(
      "UPDATE user_companies SET activity_status = 'Check Out' WHERE user_id = ? AND company_id != ?",
      [userId, currentCompanyId],
    );
  }

  async checkoutAllCompanies(userId: number): Promise<void> {
    await this.logRepository.query(
      "UPDATE user_companies SET activity_status = 'Check Out' WHERE user_id = ?",
      [userId],
    );
  }

  /**
   * Fetches shift schedules for a specific shift_id filtered by day-of-week names.
   * Used by getShiftDetails to load yesterday/today/tomorrow schedules.
   */
  async findShiftSchedulesByDays(
    shiftId: number,
    days: string[],
  ): Promise<ShiftScheduleEntity[]> {
    return this.shiftScheduleRepository.find({
      where: {
        shift_id: shiftId,
        day: In(days),
      },
    });
  }

  /**
   * Reads the shift_id assigned to the user in a specific company from user_companies.
   * Uses raw SQL to keep module isolation (user_companies owned by Users module).
   */
  async findLocationLogsByDates(
    userId: number,
    dates: Date[],
  ): Promise<{ created_at: Date }[]> {
    return await this.locationLogRepository.find({
      where: {
        user_id: userId,
        created_at: In(dates),
      },
      select: ['created_at'],
    });
  }

  async findUserJobLocationsByCompanyIds(
    userId: number,
    companyIds: number[],
  ): Promise<UserJobLocationEntity[]> {
    return await this.userJobLocationRepository.find({
      where: {
        user_id: userId,
        jobLocation: {
          company_id: In(companyIds),
          status: 'active',
        },
      },
      relations: ['jobLocation'],
    });
  }

  async insertBulkLocationLogs(
    logs: Partial<LocationLogEntity>[],
  ): Promise<number> {
    if (logs.length === 0) return 0;

    const chunks = this.chunkArray(logs, 50);
    let totalInserted = 0;
    const maxRetries = 3;

    for (const chunk of chunks) {
      let retryCount = 0;
      let inserted = false;

      while (!inserted && retryCount < maxRetries) {
        try {
          // TypeORM doesn't have a direct "insertOrIgnore" that returns count in a cross-DB way easily
          // But for MySQL, we can use QueryBuilder for IGNORE
          const result = await this.locationLogRepository
            .createQueryBuilder()
            .insert()
            .values(chunk)
            .orIgnore() // This works for MySQL/SQLite/PostgreSQL(9.5+)
            .execute();

          // orIgnore() in TypeORM might not return identifiers for ignored rows depending on driver
          // For simplicity and matching Laravel's count-based return:
          totalInserted += result.identifiers.filter(
            (id) => id !== null,
          ).length;
          inserted = true;
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes('Lock wait timeout exceeded')
          ) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, 100 * retryCount),
              );
              continue;
            }
          }
          throw error;
        }
      }
    }

    return totalInserted;
  }

  async createLocationLog(data: Partial<LocationLogEntity>): Promise<void> {
    const log = this.locationLogRepository.create(data);
    await this.locationLogRepository.save(log);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private mapToDomain(entity: UserLogEntity): UserLog {
    return new UserLog(
      entity.id,
      entity.user_id,
      entity.company_id,
      entity.activity_status,
      Number(entity.latitude),
      Number(entity.longitude),
      entity.shift_start_time,
      entity.shift_end_time,
      entity.shift_start_datetime,
      entity.shift_end_datetime,
      Number(entity.user_job_location_latitude),
      Number(entity.user_job_location_longitude),
      Number(entity.user_job_location_radius),
      entity.shift_date,
      entity.is_holiday,
      Number(entity.buffer_hours),
      entity.day_off_id,
      entity.created_at,
      entity.updated_at,
    );
  }
}

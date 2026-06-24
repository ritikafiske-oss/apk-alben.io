import { UserLog } from '../user-log.entity';
import { JobLocation } from '../job-location.entity';
import { LocationLogEntity } from '../../infrastructure/persistence/entities/location-log.entity';
import { UserJobLocationEntity } from '../../infrastructure/persistence/entities/user-job-location.entity';
import { ShiftScheduleEntity } from '../../infrastructure/persistence/entities/shift-schedule.entity';

export const LOCATIONS_REPOSITORY = Symbol('LOCATIONS_REPOSITORY');

export interface LocationsRepositoryPort {
  findLastLog(userId: number, companyId: number): Promise<UserLog | null>;
  findUserJobLocation(
    userId: number,
    companyId: number,
  ): Promise<JobLocation | null>;
  createUserLog(log: Partial<UserLog>): Promise<UserLog>;
  updateUserCompanyStatus(
    userId: number,
    companyId: number,
    status: string,
  ): Promise<void>;
  checkoutAllOtherCompanies(
    userId: number,
    currentCompanyId: number,
  ): Promise<void>;
  checkoutAllCompanies(userId: number): Promise<void>;
  /**
   * Returns the three shift schedules (yesterday/today/tomorrow day-of-week names)
   * for a given shift_id. Used to implement getShiftDetails logic.
   */
  findShiftSchedulesByDays(
    shiftId: number,
    days: string[],
  ): Promise<ShiftScheduleEntity[]>;
  findLocationLogsByDates(
    userId: number,
    dates: Date[],
  ): Promise<{ created_at: Date }[]>;
  findUserJobLocationsByCompanyIds(
    userId: number,
    companyIds: number[],
  ): Promise<UserJobLocationEntity[]>;
  insertBulkLocationLogs(
    logs: DeepPartial<LocationLogEntity>[],
  ): Promise<number>;
  createLocationLog(data: Partial<LocationLogEntity>): Promise<void>;
}

// Helper type for TypeORM shallow persistence logic if needed, or just import it
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

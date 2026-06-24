/**
 * User Log Domain Entity
 *
 * Represents a atomic check-in or check-out event in the system.
 * Contains both user-provided data (GPS) and system-calculated context (Shift/Location).
 */
export class UserLog {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly companyId: number,
    public readonly activityStatus: string, // 'Check In' or 'Check Out'
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly shiftStartTime: string | null,
    public readonly shiftEndTime: string | null,
    public readonly shiftStartDatetime: string | null,
    public readonly shiftEndDatetime: string | null,
    public readonly userJobLocationLatitude: number,
    public readonly userJobLocationLongitude: number,
    public readonly userJobLocationRadius: number,
    public readonly shiftDate: string | null,
    public readonly isHoliday: number,
    public readonly bufferHours: number = 3.0,
    public readonly dayOffId: number | null = null,
    public readonly createdAt: Date | null = null,
    public readonly updatedAt: Date | null = null,
  ) {}
}

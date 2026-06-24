/**
 * Shift Details Interface
 *
 * Represents the calculated snapshot of a user's shift context at a given time.
 * This is a domain-level data structure used to determine shift-based business rules.
 */
export interface ShiftDetails {
  shift_date: string | null;
  shift_start_datetime: string | null;
  shift_end_datetime: string | null;
  adjusted_start_datetime: string | null;
  adjusted_end_datetime: string | null;
  is_holiday: number;
  buffer_hours: number;
  shift_day: string | null;
  is_shift_ongoing: boolean;
  shift_start_time: string | null;
  shift_end_time: string | null;
}

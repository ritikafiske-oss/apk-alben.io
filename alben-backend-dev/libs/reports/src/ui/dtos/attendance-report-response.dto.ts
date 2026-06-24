import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from '@libs/common';

/**
 * Attendance Record DTO
 *
 * Represents a single day's attendance record with paired check-in/out times
 * and calculated working hours based on shift and buffer rules.
 */
export class AttendanceRecordDto {
  @ApiProperty({ description: 'ID of the user', example: 5 })
  user_id: number;

  @ApiProperty({ description: 'ID of the company', example: 1 })
  company_id: number;

  @ApiProperty({
    description: 'Date of the attendance record (YYYY-MM-DD)',
    example: '2024-03-01',
  })
  date: string;

  @ApiProperty({
    description: 'First check-in time of the day',
    nullable: true,
    example: '09:00 AM',
  })
  check_in_time: string | null;

  @ApiProperty({
    description: 'Last check-out time of the day',
    nullable: true,
    example: '06:00 PM',
  })
  check_out_time: string | null;

  @ApiProperty({
    description: 'Total working hours in HH:mm format',
    example: '09:00',
  })
  total_hours: string;

  @ApiProperty({ description: 'Total working minutes', example: 540 })
  total_minutes: number;

  @ApiProperty({
    description: 'Total working time in seconds for calculations',
    example: 32400,
  })
  total_hours_in_seconds: number;

  @ApiProperty({
    description: 'Latitude of the first check-in',
    nullable: true,
    example: 18.5204,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Longitude of the first check-in',
    nullable: true,
    example: 73.8567,
  })
  longitude: number | null;
}

/**
 * Attendance Report Data DTO
 *
 * Contains aggregated attendance statistics and the list of daily records.
 */
export class AttendanceReportDataDto {
  @ApiProperty({
    description: 'Total hours worked today (HH:mm)',
    example: '08:30',
  })
  today_hr: string;

  @ApiProperty({
    description: 'Total hours worked in the current week (HH:mm)',
    example: '42:15',
  })
  current_week_hr: string;

  @ApiProperty({
    description: 'Total hours worked in the current month (HH:mm)',
    example: '168:00',
  })
  current_month_hr: string;

  @ApiProperty({
    description: 'Total hours worked in the last month (HH:mm)',
    example: '160:30',
  })
  last_month_hr: string;

  @ApiProperty({
    description: 'Current activity status of the user',
    nullable: true,
    example: 'Check In',
  })
  current_status: string | null;

  @ApiProperty({ description: 'Current page number', example: 1 })
  current_page: number;

  @ApiProperty({ description: 'Total number of pages', example: 1 })
  total_pages: number;

  @ApiProperty({ description: 'Total number of items found', example: 10 })
  total_items: number;

  @ApiProperty({
    type: [AttendanceRecordDto],
    description: 'List of daily attendance records',
  })
  records: AttendanceRecordDto[];
}

/**
 * Get Attendance Report Response DTO
 *
 * Standard API response wrapper for the attendance report.
 * Matches the Laravel-style response structure used across the application.
 */
export class GetAttendanceReportResponseDto extends ApiResponse<AttendanceReportDataDto> {
  @ApiProperty({
    type: AttendanceReportDataDto,
    description: 'The attendance report data',
  })
  declare data: AttendanceReportDataDto;
}

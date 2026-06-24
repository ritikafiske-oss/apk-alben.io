import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsResponseDto {
  @ApiProperty({ description: 'Number of completed reminders', example: 0 })
  completedReminderCount: number;

  @ApiProperty({ description: 'Number of set reminders', example: 0 })
  setReminderCount: number;

  @ApiProperty({ description: 'Number of completed new leads', example: 0 })
  completedNewLeadCount: number;

  @ApiProperty({ description: 'Total number of new leads', example: 0 })
  totalNewLeadCount: number;

  @ApiProperty({ description: 'Number of completed overdue leads', example: 0 })
  completedOverdueCount: number;

  @ApiProperty({ description: 'Total number of overdue leads', example: 0 })
  totalOverdueCount: number;

  @ApiProperty({
    description: 'Number of completed auto-dial leads',
    example: 0,
  })
  completedAutoDialLeadCount: number;

  @ApiProperty({ description: 'Total number of auto-dial leads', example: 0 })
  totalAutoDialLeadCount: number;

  @ApiProperty({
    description: 'User checked-in time (ISO Date string)',
    example: '2026-02-25T10:00:00Z',
    type: String,
    nullable: true,
  })
  checkedInTime: string | null;
}

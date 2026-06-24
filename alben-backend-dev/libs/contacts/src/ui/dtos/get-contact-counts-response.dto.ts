import { ApiProperty } from '@nestjs/swagger';

export class ContactCountsResponseDto {
  @ApiProperty({ description: 'Total number of items in My Plan', example: 0 })
  my_plan: number;

  @ApiProperty({
    description: 'Number of newly assigned contacts',
    example: 10,
  })
  new: number;

  @ApiProperty({ description: 'Number of pending reminders', example: 5 })
  reminder: number;

  @ApiProperty({ description: 'Number of overdue reminders', example: 3 })
  overdue: number;
}

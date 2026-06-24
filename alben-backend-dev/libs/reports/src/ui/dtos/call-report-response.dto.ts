import { ApiProperty } from '@nestjs/swagger';

export class CallStatusStatDto {
  @ApiProperty({
    description: 'The name of the contact status',
    example: 'Interested',
  })
  contact_status: string;

  @ApiProperty({
    description:
      'Total number of products in this status (unique Client+Product pairs)',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Color code associated with the status',
    example: '#FF0000',
  })
  color_code: string;

  @ApiProperty({
    description:
      'Percentage of unique products reaching this status (last status)',
    example: 30.5,
  })
  percentage: number;
}

export class CallReportDataDto {
  @ApiProperty({
    description: 'Total number of calls across all statuses',
    example: 10,
  })
  total_calls: number;

  @ApiProperty({
    description: 'Total duration across all calls in MM:SS format',
    example: '25:00',
  })
  total_duration: string;

  @ApiProperty({
    description: 'Total number of entries in call_log_product_details',
    example: 10,
  })
  total_call_log_product_details_count: number;

  @ApiProperty({
    description: 'Breakdown of call statistics by status',
    type: [CallStatusStatDto],
  })
  contact_statuses: CallStatusStatDto[];
}

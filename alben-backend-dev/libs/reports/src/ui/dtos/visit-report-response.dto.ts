import { ApiProperty } from '@nestjs/swagger';

export class VisitTypeStatDto {
  @ApiProperty({
    description: 'The name of the visit type',
    example: 'Sales Visit',
  })
  visit_type: string;

  @ApiProperty({
    description: 'Total number of visits of this type',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Color code associated with the visit type',
    example: '#00FF00',
  })
  color_code: string;

  @ApiProperty({
    description:
      'Percentage of unique products reaching this visit type (last visit)',
    example: 30.5,
  })
  percentage: number;
}

export class VisitReportDataDto {
  @ApiProperty({
    description: 'Total number of visits across all types',
    example: 10,
  })
  total_visits: number;

  @ApiProperty({
    description: 'Total travelling distance across all visits in km',
    example: '15.5 km',
  })
  total_travelling_distance: string;

  @ApiProperty({
    description:
      'Total number of unique Client+Product pairs in visit_log_product_details',
    example: 10,
  })
  total_visit_log_product_details_count: number;

  @ApiProperty({
    description: 'Breakdown of visit statistics by type',
    type: [VisitTypeStatDto],
  })
  visit_types: VisitTypeStatDto[];
}

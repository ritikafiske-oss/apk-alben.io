import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FilterByEnum {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  PREVIOUS_WEEK = 'previous_week',
  THIS_MONTH = 'this_month',
  PREVIOUS_MONTH = 'previous_month',
  THIS_YEAR = 'this_year',
  CUSTOM_DATE = 'custom_date',
}

export class GetReportsQueryDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Filter range by period',
    enum: FilterByEnum,
    example: FilterByEnum.TODAY,
  })
  @IsNotEmpty()
  @IsEnum(FilterByEnum)
  filter_by: FilterByEnum;

  @ApiPropertyOptional({
    description: 'Product ID (optional)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({
    description:
      'Start date (YYYY-MM-DD), required if filter_by is custom_date',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD), required if filter_by is custom_date',
    example: '2026-03-07',
  })
  @IsOptional()
  @IsString()
  end_date?: string;
}

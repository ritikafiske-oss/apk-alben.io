import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GetCallLogsProductFilterEnum {
  ALL = 'all',
}

export enum CallLogTypeFilterEnum {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
  MISSED = 'missed',
  REJECTED = 'rejected',
  VOICEMAIL = 'voicemail',
}

export enum GetCallLogsContactTypeEnum {
  ALL = 'all',
  COLLEAGUE = 'colleague',
  VENDOR = 'vendor',
  CLIENT = 'client',
}

export class GetCallLogsDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNumber()
  @Type(() => Number)
  company_id: number;

  @ApiPropertyOptional({
    type: 'string',
    example: '1,2,3',
    description: 'Can be "all" or comma-separated product IDs',
  })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Contact Status ID or comma-separated Status IDs',
    example: '1,2,3',
    required: false,
  })
  @IsOptional()
  @IsString()
  status_id?: string;

  @ApiPropertyOptional({
    enum: GetCallLogsContactTypeEnum,
    example: 'all',
  })
  @IsEnum(GetCallLogsContactTypeEnum)
  @IsOptional()
  contact_type?: GetCallLogsContactTypeEnum = GetCallLogsContactTypeEnum.ALL;

  @ApiPropertyOptional({
    description: 'Filter logs from this date (YYYY-MM-DD)',
    example: '2024-03-01',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'start_date must be in YYYY-MM-DD format e.g. 2023-07-01',
  })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Filter logs up to this date (YYYY-MM-DD)',
    example: '2024-03-31',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'end_date must be in YYYY-MM-DD format e.g. 2023-07-31',
  })
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Pagination limit', example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 200;

  @ApiPropertyOptional({ description: 'Pagination page', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Search term (mobile or name)',
    example: '9123',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by call type',
    enum: CallLogTypeFilterEnum,
    example: 'outgoing',
  })
  @IsEnum(CallLogTypeFilterEnum)
  @IsOptional()
  call_type?: CallLogTypeFilterEnum;
}

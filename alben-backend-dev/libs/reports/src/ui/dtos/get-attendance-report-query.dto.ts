import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Get Attendance Report Query DTO
 *
 * Defines the validation rules and Swagger documentation for the
 * attendance report filtering parameters.
 */
export class GetAttendanceReportQueryDto {
  @ApiProperty({
    description: 'The ID of the company',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  company_id: number;

  @ApiPropertyOptional({
    description: 'Start date in YYYY-MM-DD format',
    example: '2024-03-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'start_date must be in YYYY-MM-DD format',
  })
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date in YYYY-MM-DD format',
    example: '2024-03-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'end_date must be in YYYY-MM-DD format',
  })
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 200;
}

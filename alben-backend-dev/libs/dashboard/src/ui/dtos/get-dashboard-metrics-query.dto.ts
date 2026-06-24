import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDashboardMetricsQueryDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;
}

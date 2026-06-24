import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetVisitLogsDto {
  @ApiProperty({
    description: 'Company ID',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Product ID',
    example: 54,
  })
  @IsNotEmpty()
  @IsInt()
  product_id: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 200,
    default: 200,
  })
  @IsOptional()
  @IsInt()
  limit?: number = 200;

  @ApiPropertyOptional({
    description: 'Filter by visit type ID',
    example: 7,
  })
  @IsOptional()
  @IsInt()
  visit_type_id?: number;
}

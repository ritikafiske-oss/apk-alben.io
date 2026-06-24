import { IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetReminderNotesDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiPropertyOptional({ description: 'Product ID (Optional)', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  product_id?: number;

  @ApiProperty({
    enum: ['All', 'visit', 'others'],
    description: 'Filter by note type',
    example: 'All',
    default: 'All',
  })
  @IsOptional()
  @IsEnum(['All', 'visit', 'others'])
  type: 'All' | 'visit' | 'others' = 'All';

  @ApiProperty({
    enum: ['today', 'tomorrow', 'upcoming', 'past'],
    description: 'Filter reminders by time period',
    example: 'upcoming',
    default: 'upcoming',
  })
  @IsOptional()
  @IsEnum(['today', 'tomorrow', 'upcoming', 'past'])
  filter_by: 'today' | 'tomorrow' | 'upcoming' | 'past' = 'upcoming';

  @ApiPropertyOptional({
    enum: ['client', 'vendor', 'colleague'],
    description: 'Filter by contact type',
    example: 'client',
  })
  @IsOptional()
  @IsEnum(['client', 'vendor', 'colleague'])
  contact_type?: 'client' | 'vendor' | 'colleague';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Limit items per page',
    example: 200,
    default: 200,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit: number = 200;
}

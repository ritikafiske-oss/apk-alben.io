import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MappedNotification } from '../../interfaces/notification.interface';

export class GetNotificationsDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  company_id: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 200,
    default: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 200;
}

export class SurpriseVisitResponse {
  @ApiProperty({ example: 1 })
  question_id: number;

  @ApiProperty({ example: 'How was your visit?' })
  question: string;

  @ApiProperty({ example: 1 })
  company_id: number;
}

export class NotificationResponseDto {
  @ApiProperty({ type: SurpriseVisitResponse, nullable: true })
  surprise_visit: SurpriseVisitResponse | null;

  @ApiProperty({ example: 5 })
  total_unread: number;

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 1 })
  total_pages: number;

  @ApiProperty({ example: 10 })
  total_items: number;

  @ApiProperty({ type: [Object], description: 'List of notifications' })
  records: MappedNotification[];
}

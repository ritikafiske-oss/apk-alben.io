import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetContactCountsQueryDto {
  @ApiProperty({
    description: 'The ID of the company to filter counts for',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  company_id: number;
}

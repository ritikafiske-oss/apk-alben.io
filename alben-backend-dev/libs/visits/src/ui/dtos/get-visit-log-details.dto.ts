import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetVisitLogDetailsDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the company',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  company_id: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the visit log',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  visit_log_id: number;
}

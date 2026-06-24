import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class GetActionRecentsQueryDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Records per page',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 200;
}

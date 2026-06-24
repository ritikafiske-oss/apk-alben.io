import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetProductsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;
}

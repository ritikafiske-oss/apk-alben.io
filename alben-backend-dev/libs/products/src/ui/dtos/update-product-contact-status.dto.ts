import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductContactStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  product_contact_id: number;
}

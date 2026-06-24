import { IsNotEmpty, IsInt, Length, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetContactStatusByProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty()
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  product_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;
}

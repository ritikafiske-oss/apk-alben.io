import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CheckContactDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile: string;
}

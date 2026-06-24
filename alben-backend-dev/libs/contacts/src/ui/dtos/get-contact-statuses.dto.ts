import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetContactStatusesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class LocationChangeRequestDto {
  @ApiProperty({
    description: 'The ID of the visit log to change location for',
    example: 123,
  })
  @IsInt()
  @IsNotEmpty()
  visit_log_id: number;

  @ApiProperty({
    description: 'Remark/Reason for the location change',
    example: 'Client shifted to a new office nearby',
  })
  @IsString()
  @IsNotEmpty()
  remark: string;
}

import { IsString, IsNumber, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for changing user activity status.
 * Used for both Check In and Check Out operations.
 */
export class ChangeStatusRequestDto {
  @ApiProperty({ example: 'Check In', enum: ['Check In', 'Check Out'] })
  @IsString()
  @IsIn(['Check In', 'Check Out'])
  activity_status: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  company_id: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

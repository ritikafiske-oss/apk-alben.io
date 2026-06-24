import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponse } from '@libs/common';

export class SyncLocationUserDeviceValuesDto {
  @ApiProperty({ example: '70%' })
  @IsOptional()
  @IsString()
  battery_percentage?: string;

  @ApiProperty({ example: 'ON' })
  @IsOptional()
  @IsString()
  gps?: string;

  @ApiProperty({ example: 'ON' })
  @IsOptional()
  @IsString()
  internet?: string;

  @ApiProperty({ example: '5.0m' })
  @IsOptional()
  @IsString()
  accuracy_distance?: string;

  @ApiProperty({ example: 'OFF' })
  @IsOptional()
  @IsString()
  flight_mode?: string;

  @ApiProperty({ example: { allow_notification: 1 } })
  @IsOptional()
  permission?: Record<string, unknown>;

  @ApiProperty({ example: 'ON' })
  @IsOptional()
  @IsString()
  wifi?: string;
}

export class SyncLocationItemDto {
  @ApiProperty({ example: 4 })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({ example: '2024-04-13 11:46:34' })
  @IsNotEmpty()
  @IsString()
  created_at: string;

  @ApiProperty({
    example:
      '1st Floor, Premier Technology Building, B-Wing, IT Park Rd, Gayatri Nagar, Pratap Nagar, Nagpur, Maharashtra 440022, India',
  })
  @IsOptional()
  @IsString()
  full_address: string;

  @ApiProperty({ example: 21.1198912 })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 79.0479882 })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 'String' })
  @IsOptional()
  @IsString()
  location_error_log?: string;

  @ApiProperty({
    example: 'others',
    enum: [
      'check_in',
      'check_out',
      'note',
      'visit',
      'call',
      'device_activity',
      'others',
    ],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ type: SyncLocationUserDeviceValuesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncLocationUserDeviceValuesDto)
  user_device_values?: SyncLocationUserDeviceValuesDto;
}

export class SyncLocationsDataDto {
  @ApiProperty({ example: 2 })
  total_locations_processed: number;

  @ApiProperty({ example: 1 })
  new_locations_inserted: number;

  @ApiProperty({ example: 1 })
  duplicates_skipped: number;
}

export class SyncLocationsResponseDto extends ApiResponse<SyncLocationsDataDto> {
  @ApiProperty({ example: true })
  declare success: boolean;

  @ApiProperty({ example: 'LOCATIONS_SYNC_SUCCESS' })
  declare code: string;

  @ApiProperty({ example: 'Locations synced successfully.' })
  declare message: string;

  @ApiProperty({ type: SyncLocationsDataDto })
  declare data: SyncLocationsDataDto;
}

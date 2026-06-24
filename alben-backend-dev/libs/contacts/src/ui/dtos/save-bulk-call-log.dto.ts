import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  ValidateIf,
} from 'class-validator';

export class CallLogItemDto {
  @ApiProperty({
    description: 'Mobile number (10 digits)',
    example: '9876543210',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be exactly 10 digits.',
  })
  mobile: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({
    description: 'Alternate number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  alternate_number?: string;

  @ApiPropertyOptional({ description: 'Business name', example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Manager' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @ValidateIf((o: CallLogItemDto) => o.email !== '')
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Contact type',
    enum: ['client', 'vendor', 'colleague'],
    example: 'client',
  })
  @IsNotEmpty()
  @IsIn(['client', 'vendor', 'colleague'])
  contact_type: string;

  @ApiProperty({
    description: 'Start call at (Y-m-d H:i:s)',
    example: '2024-03-17 14:30:00',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'start_call_at must match the format Y-m-d H:i:s',
  })
  start_call_at: string;

  @ApiProperty({ description: 'Duration in seconds', example: 45 })
  @IsNotEmpty()
  @IsInt()
  duration: number;

  @ApiProperty({
    description: 'Call type',
    enum: ['outgoing', 'incoming', 'missed', 'rejected', 'voicemail'],
    example: 'outgoing',
  })
  @IsNotEmpty()
  @IsIn(['outgoing', 'incoming', 'missed', 'rejected', 'voicemail'])
  call_type: string;

  @ApiProperty({
    description: 'Call status',
    enum: ['answered', 'unanswered'],
    example: 'answered',
  })
  @IsNotEmpty()
  @IsIn(['answered', 'unanswered'])
  call_status: string;

  @ApiProperty({
    description: 'Dial type',
    enum: ['autodial', 'manualdial'],
    example: 'autodial',
  })
  @IsNotEmpty()
  @IsIn(['autodial', 'manualdial'])
  dial_type: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 28.6139 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: 77.209 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'App call log ID', example: 1001 })
  @IsOptional()
  @IsInt()
  app_call_log_id?: number;
}

export class SaveBulkCallLogRequestDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({
    type: [CallLogItemDto],
    description: 'List of call logs to save',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallLogItemDto)
  call_logs: CallLogItemDto[];
}

export class AppCallLogIdDto {
  @ApiProperty({
    description: 'Call log ID from the application',
    example: 123,
    nullable: true,
  })
  app_call_log_id: number | null;

  @ApiProperty({
    description: 'Internal call log ID',
    example: 456,
    nullable: true,
  })
  call_log_id: number | null;
}

export class SaveBulkCallLogsDataDto {
  @ApiProperty({
    type: [AppCallLogIdDto],
    description: 'List of mapped call log IDs',
  })
  call_log_ids: AppCallLogIdDto[];
}

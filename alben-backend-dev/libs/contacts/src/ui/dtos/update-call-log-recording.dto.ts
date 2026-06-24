import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateCallLogRecordingRequestDto {
  @ApiProperty({ description: 'Call log ID', example: 4318 })
  @IsNotEmpty()
  @IsInt()
  call_log_id: number;

  @ApiProperty({
    description: 'Recording URL',
    example: 'https://example.com/recording.mp3',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  recording_url: string;
}

import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
  Length,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiPropertyOptional({ description: 'Product ID (Optional)', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  product_id?: number | null;

  @ApiProperty({
    description: 'Mobile Number (10 digits)',
    example: '9876543210',
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'mobile must be a number' })
  mobile: string;

  @ApiProperty({
    description: 'Note description',
    example: 'Follow up required',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Reminder Date Time (YYYY-MM-DD HH:mm:ss)',
    example: '2024-03-25 14:30:00',
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null) // Skip validation if null
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'reminder_datetime must be in the format YYYY-MM-DD HH:mm:ss',
  })
  reminder_datetime?: string | null;

  @ApiProperty({
    enum: ['visit', 'others'],
    description: 'Type of note',
    example: 'others',
  })
  @IsNotEmpty()
  @IsEnum(['visit', 'others'])
  for_note: 'visit' | 'others';

  @ApiProperty({
    description: 'Record creation Date Time (YYYY-MM-DD HH:mm:ss)',
    example: '2024-03-17 16:45:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'created_at must be in the format YYYY-MM-DD HH:mm:ss',
  })
  created_at: string;
}

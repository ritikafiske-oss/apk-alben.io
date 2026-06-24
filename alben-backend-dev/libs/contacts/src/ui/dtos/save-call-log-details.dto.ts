import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Matches,
  ValidateNested,
  ValidateIf,
} from 'class-validator';

export class CallLogProductDetailItemDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 63 })
  @IsOptional()
  @IsInt()
  product_id?: number;

  @ApiPropertyOptional({ description: 'Status ID', example: 22 })
  @IsOptional()
  @IsInt()
  status_id?: number;

  @ApiPropertyOptional({
    description: 'Note description',
    example: 'Follow up after 2 days',
  })
  @IsOptional()
  @IsString()
  note_description?: string;

  @ApiPropertyOptional({
    description: 'Note reminder datetime (Y-m-d H:i:s)',
    example: '2024-03-20 10:00:00',
  })
  @ValidateIf(
    (o: CallLogProductDetailItemDto) =>
      o.note_reminder_datetime !== '' &&
      o.note_reminder_datetime !== undefined &&
      o.note_reminder_datetime !== null,
  )
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'note_reminder_datetime must match the format Y-m-d H:i:s',
  })
  note_reminder_datetime?: string;

  @ApiProperty({
    description: 'Dial type',
    enum: ['autodial', 'manualdial'],
    example: 'autodial',
  })
  @IsNotEmpty()
  @IsIn(['autodial', 'manualdial'])
  dial_type: string;
}

export class SaveCallLogDetailsRequestDto {
  @ApiProperty({ description: 'Call log ID', example: 4318 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  call_log_id: number;

  @ApiProperty({
    type: [CallLogProductDetailItemDto],
    description: 'List of product details and notes',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallLogProductDetailItemDto)
  products: CallLogProductDetailItemDto[];
}

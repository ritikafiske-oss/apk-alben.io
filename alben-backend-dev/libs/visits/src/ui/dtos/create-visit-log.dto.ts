import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VisitProductDetailDto {
  @ApiProperty({
    description: 'Product ID',
    example: 54,
  })
  @IsNotEmpty()
  @IsInt()
  product_id: number;

  @ApiPropertyOptional({
    description: 'Remark for the product visit',
    example: 'Interested in product X',
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({
    description:
      'Reminder date and time (IST): YYYY-MM-DD HH:mm:ss. A note will be created with this timestamp.',
    example: '2026-03-24 10:00:00',
  })
  @IsOptional()
  @ValidateIf(
    (o: VisitProductDetailDto) =>
      o.reminder_datetime !== '' && o.reminder_datetime !== null,
  )
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'reminder_datetime must be in format YYYY-MM-DD HH:mm:ss',
  })
  reminder_datetime?: string;

  @ApiProperty({
    description: 'Visit type ID for this product',
    example: 7,
  })
  @IsNotEmpty()
  @IsInt()
  visit_type_id: number;
}

export class VisitItemDto {
  @ApiProperty({
    description: 'Mobile number of the contact',
    example: '9876543210',
  })
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiProperty({
    description:
      'Actual creation date and time in IST format (YYYY-MM-DD HH:mm:ss)',
    example: '2026-03-23 15:30:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: 'created_at must be in format YYYY-MM-DD HH:mm:ss',
  })
  created_at: string;

  @ApiProperty({
    description: 'Latitude of the visit location',
    example: 21.1458,
  })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the visit location',
    example: 79.0882,
  })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'URL or path to the visit photo',
    example: 'https://example.com/uploads/visit_1.jpg',
  })
  @IsNotEmpty()
  @IsString()
  photo: string;

  @ApiProperty({
    type: [VisitProductDetailDto],
    description:
      'Array of products pitched during this visit. Only linked products will be processed.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitProductDetailDto)
  products: VisitProductDetailDto[];
}

export class CreateVisitLogDto {
  @ApiProperty({
    description: 'Company ID',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({
    type: [VisitItemDto],
    description: 'Array of visits to be saved in a batch.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitItemDto)
  visits: VisitItemDto[];
}

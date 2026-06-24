import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachmentItemDto {
  @ApiProperty({
    description: 'Filename of the attachment',
    example: 'image(1).png',
  })
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'URL of the attachment',
    example:
      'https://dev.cdn.alben.io/4/attachments/171cfa16-999d-4117-906b-ee4e770d7a68.png',
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}

export class UploadAttachmentsDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty({
    type: String,
    description: 'Contact ID',
    required: true,
    example: '',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  contact_id: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Product ID (optional)',
    example: '',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @ApiProperty({
    type: [AttachmentItemDto],
    required: true,
    description: 'Array of attachments with filename and url',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentItemDto)
  attachments: AttachmentItemDto[];
}

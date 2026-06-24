import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsEmail,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  Length,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactItemDto {
  @ApiProperty({ description: 'Contact First Name', example: 'Tac 1' })
  @IsString()
  firstname: string;

  @ApiPropertyOptional({ description: 'Contact Last Name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({
    description: 'Contact Alternate Number',
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  alternate_number?: string;

  @ApiPropertyOptional({
    description: 'Contact Business Name',
    example: 'Acme Corp',
  })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiPropertyOptional({
    description: 'Contact Designation',
    example: 'Purchasing Manager',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Contact Email Address',
    example: 'contact@example.com',
  })
  @IsOptional()
  @ValidateIf((o: CreateContactItemDto) => o.email !== '')
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Product ID (Required if client or vendor)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  product_id?: number;

  @ApiPropertyOptional({ description: 'Status ID', example: 1 })
  @IsOptional()
  @IsInt()
  status_id?: number;

  @ApiPropertyOptional({
    description: 'Contact Type (client, vendor, colleague)',
    example: 'client',
  })
  @IsOptional()
  @IsIn(['client', 'vendor', 'colleague'])
  contact_type?: string;

  @ApiPropertyOptional({ description: 'Contact Mobile Number (10 digits)' })
  @IsOptional()
  @IsNumberString()
  @Length(10, 10, { message: 'The mobile field must be exactly 10 digits.' })
  mobile?: string;
}

export class CreateContactRequestDto {
  @ApiPropertyOptional({ description: 'Reference by Contact ID', example: 123 })
  @IsOptional()
  @IsInt()
  reference_by_contact_id?: number;

  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Array of contacts to create',
    type: [CreateContactItemDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Contacts array is required and cannot be empty.' })
  @ValidateNested({ each: true })
  @Type(() => CreateContactItemDto)
  contacts: CreateContactItemDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsEmail,
  Length,
  ValidateIf,
} from 'class-validator';

export class UpdateContactRequestDto {
  @ApiProperty({ description: 'Contact ID', example: 8176 })
  @IsInt()
  contact_id: number;

  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsInt()
  company_id: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Status ID', example: 28 })
  @IsInt()
  status_id: number;

  @ApiProperty({ description: 'Contact First Name', example: 'Peter' })
  @IsString()
  firstname: string;

  @ApiPropertyOptional({ description: 'Contact Last Name', example: 'Parker' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({ description: 'Contact Mobile Number (10 digits)' })
  @IsOptional()
  @IsNumberString()
  @Length(10, 10, { message: 'The mobile field must be exactly 10 digits.' })
  mobile?: string;

  @ApiPropertyOptional({
    description: 'Contact Alternate Number',
    example: '7787788899',
  })
  @IsOptional()
  @IsString()
  alternate_number?: string;

  @ApiPropertyOptional({
    description: 'Contact Business Name',
    example: 'Logic Innovates',
  })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiPropertyOptional({
    description: 'Contact Designation',
    example: 'Content Writer',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Contact Email Address',
    example: 'test@yopmail.com',
  })
  @IsOptional()
  @ValidateIf((o: UpdateContactRequestDto) => o.email !== '')
  @IsEmail()
  email?: string;
}

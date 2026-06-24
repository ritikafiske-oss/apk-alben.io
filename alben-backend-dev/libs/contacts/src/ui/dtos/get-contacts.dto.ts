import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  ValidateIf,
} from 'class-validator';

export enum ContactTypeEnum {
  COLLEAGUE = 'colleague',
  VENDOR = 'vendor',
  CLIENT = 'client',
}

export enum DialTypeEnum {
  AUTODIAL = 'autodial',
  MANUALDIAL = 'manualdial',
  ALL = 'all',
}

export enum FilterByEnum {
  A_Z = 'A-Z',
  Z_A = 'Z-A',
}

export class GetContactsDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiPropertyOptional({
    description: 'Product ID or comma-separated Product IDs',
    example: '1,2,3',
    required: false,
  })
  @ValidateIf(
    (o: GetContactsDto) =>
      o.type === ContactTypeEnum.VENDOR || o.type === ContactTypeEnum.CLIENT,
  )
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({
    description:
      'Contact type. If omitted, returns all authorized contacts (client, vendor, and colleague).',
    enum: ContactTypeEnum,
    example: 'client',
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactTypeEnum)
  type?: ContactTypeEnum;

  @ApiPropertyOptional({
    description:
      'Dial type. Filters results by autodial/manualdial flags. Vendors and colleagues are treated as manual contacts.',
    enum: DialTypeEnum,
    example: 'manualdial',
    required: false,
  })
  @IsOptional()
  @IsEnum(DialTypeEnum)
  dial?: DialTypeEnum = DialTypeEnum.MANUALDIAL;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Records per page',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 200;

  @ApiPropertyOptional({
    description: 'Search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start Date (YYYY-MM-DD)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End Date (YYYY-MM-DD)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by',
    enum: FilterByEnum,
    example: 'A-Z',
    required: false,
  })
  @IsOptional()
  @IsEnum(FilterByEnum)
  filter_by?: FilterByEnum;

  @ApiPropertyOptional({
    description: 'Contact Status ID or comma-separated Status IDs',
    example: '1,2,3',
    required: false,
  })
  @IsOptional()
  @IsString()
  status_id?: string;
}

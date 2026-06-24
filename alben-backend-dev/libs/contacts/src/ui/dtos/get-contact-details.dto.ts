import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, ValidateIf, Min } from 'class-validator';
import { ContactTypeEnum } from './get-contacts.dto';

export class GetContactDetailsDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  company_id: number;

  @ApiProperty({ description: 'Contact ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  contact_id: number;

  @ApiProperty({
    description: 'Type of contact',
    enum: ContactTypeEnum,
    example: ContactTypeEnum.CLIENT,
  })
  @IsNotEmpty()
  @IsEnum(ContactTypeEnum)
  type: ContactTypeEnum;

  @ApiPropertyOptional({
    description: 'Product ID (required for client/vendor)',
    example: 1,
  })
  @ValidateIf(
    (o: GetContactDetailsDto) =>
      o.type === ContactTypeEnum.VENDOR || o.type === ContactTypeEnum.CLIENT,
  )
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  product_id?: number;
}

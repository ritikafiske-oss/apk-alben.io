import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetVisitTypesDto {
  @ApiProperty({
    description: 'Company ID',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  company_id: number;
}

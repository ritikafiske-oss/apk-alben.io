import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SaveSurpriseVisitDto {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Question ID for the surprise visit',
    example: 12,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  question_id: number;

  @ApiProperty({
    description: 'Answer provided for the surprise visit question',
    example: 'Sample answer or feedback',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Latitude of the surprise visit location',
    example: 21.1458,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the surprise visit location',
    example: 79.0882,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;
}

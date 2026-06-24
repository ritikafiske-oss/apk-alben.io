import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MarkMyPlanTypeEnum {
  NOTES = 'notes',
  CALL = 'call',
}

export class MarkMyPlanItemDto {
  @ApiProperty({
    example: 123,
    description:
      'The ID of the item, corresponding to call_or_note_id from action details.',
  })
  @IsInt()
  id: number;

  @ApiProperty({
    enum: MarkMyPlanTypeEnum,
    example: 'notes',
    description:
      'The type of the item, corresponding to data_from from action details (call or notes).',
  })
  @IsEnum(MarkMyPlanTypeEnum)
  type: MarkMyPlanTypeEnum;
}

export class MarkMyPlanRequestDto {
  @ApiProperty({ type: [MarkMyPlanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkMyPlanItemDto)
  items: MarkMyPlanItemDto[];
}

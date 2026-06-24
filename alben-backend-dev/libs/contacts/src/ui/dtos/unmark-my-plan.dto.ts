import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MarkMyPlanTypeEnum } from './mark-my-plan.dto';

export class UnmarkMyPlanItemDto {
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

export class UnmarkMyPlanRequestDto {
  @ApiProperty({ type: [UnmarkMyPlanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnmarkMyPlanItemDto)
  items: UnmarkMyPlanItemDto[];
}

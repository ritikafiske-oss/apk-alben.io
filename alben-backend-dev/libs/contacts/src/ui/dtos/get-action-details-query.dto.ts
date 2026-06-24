import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export enum ActionTypeEnum {
  MY_PLAN = 'my_plan',
  NEW = 'new',
  REMINDER = 'reminder',
  OVERDUE = 'overdue',
}

export class GetActionDetailsQueryDto {
  @ApiProperty({ description: 'Company ID', example: 4 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty({
    description: 'Action type',
    enum: ActionTypeEnum,
    example: 'new',
  })
  @IsNotEmpty()
  @IsEnum(ActionTypeEnum)
  action_type: ActionTypeEnum;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Records per page',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 200;
}

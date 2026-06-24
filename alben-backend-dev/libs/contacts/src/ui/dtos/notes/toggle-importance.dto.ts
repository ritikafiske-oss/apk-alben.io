import { IsNotEmpty, IsInt, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleImportanceDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  company_id: number;

  @ApiProperty({ description: 'Note ID to toggle', example: 123 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  note_id: number;

  @ApiProperty({
    enum: ['add', 'remove'],
    description: 'Action to perform: add to or remove from important notes',
    example: 'add',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['add', 'remove'])
  action: 'add' | 'remove';
}

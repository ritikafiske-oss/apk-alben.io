import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: '9764233336', description: 'User mobile number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  mobile: string;
}

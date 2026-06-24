import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumberString,
  Length,
  MinLength,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: '9764233336', description: 'User mobile number' })
  @IsNotEmpty({ message: 'The mobile field is required.' })
  @IsString()
  @MaxLength(255)
  mobile: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsNotEmpty({ message: 'The otp field is required.' })
  @IsNumberString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New password (min 8 chars)',
  })
  @IsNotEmpty({ message: 'The password field is required.' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Confirm new password',
  })
  @IsNotEmpty({ message: 'The confirm password field is required.' })
  @IsString()
  @MinLength(8)
  @Match('password', {
    message: 'The confirm password and password must match.',
  })
  confirm_password: string;
}

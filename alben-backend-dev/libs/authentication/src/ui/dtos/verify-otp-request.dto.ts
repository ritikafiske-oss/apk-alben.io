import { IsNotEmpty, IsNumberString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpRequestDto {
  @ApiProperty({
    description: '10-digit mobile number',
    example: '9876543210',
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
  mobile: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}

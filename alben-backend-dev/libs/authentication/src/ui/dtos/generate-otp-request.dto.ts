import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateOtpRequestDto {
  @ApiProperty({
    description: '10-digit mobile number',
    example: '9876543210',
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
  mobile: string;
}

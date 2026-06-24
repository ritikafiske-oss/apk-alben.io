import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsIn,
  Matches,
} from 'class-validator';

/**
 * Update User Profile DTO
 *
 * Defines the schema and validation rules for updating a user's profile.
 * Strictly follows the specification from the Laravel reference implementation.
 *
 * @rules
 * - firstname: required, string, max 25
 * - lastname: required, string, max 25
 * - email: required, email format, unique
 * - mobile: required, unique
 * - profile_image: optional, valid URL, must be an image (jpeg, png, jpg, gif)
 * - isDeleteProfileImg: optional, 0 or 1
 */
export class UpdateUserProfileDto {
  @ApiProperty({
    description: "User's first name",
    example: 'John',
    maxLength: 25,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  firstname: string;

  @ApiProperty({
    description: "User's last name or surname",
    example: 'Doe',
    maxLength: 25,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  lastname: string;

  @ApiProperty({
    description: "User's email address (must be unique)",
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's 10-digit mobile number (must be unique)",
    example: '9764233311',
  })
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiPropertyOptional({
    description: 'URL to the profile image',
    example: 'https://example.com/images/profile.jpg',
  })
  @IsOptional()
  @IsUrl()
  @Matches(/\.(jpeg|jpg|png|gif)$/i, {
    message: 'profile_image must be a valid image URL (jpeg, png, jpg, gif)',
  })
  profile_image?: string;

  @ApiPropertyOptional({
    description: 'Flag to delete current profile image (1 = delete, 0 = keep)',
    example: 0,
    enum: [0, 1],
  })
  @IsOptional()
  @IsIn([0, 1])
  isDeleteProfileImg?: number;

  @ApiPropertyOptional({
    description: "User's gender",
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: string;
}

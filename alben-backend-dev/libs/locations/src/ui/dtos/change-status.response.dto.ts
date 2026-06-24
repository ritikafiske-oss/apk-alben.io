import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response for status change operations.
 * Follows the project's ApiResponse pattern with mandatory success, code, and message.
 */
export class ChangeStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'CHECK_IN_SUCCESS' })
  code: string;

  @ApiProperty({ example: 'Check In successfully.' })
  message: string;

  @ApiProperty({ required: false })
  data?: Record<string, unknown> | null;
}

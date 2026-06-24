import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, User } from '@libs/common';
import { AuthenticationService } from '../application/authentication.service';
import { LoginRequestDto } from './dtos/login-request.dto';
import {
  LoginResponseDto,
  LoginResponseDataDto,
} from './dtos/login-response.dto';
import { ResetPasswordRequestDto } from './dtos/reset-password-request.dto';
import { ForgotPasswordRequestDto } from './dtos/forgot-password-request.dto';
import { GenerateOtpRequestDto } from './dtos/generate-otp-request.dto';
import { VerifyOtpRequestDto } from './dtos/verify-otp-request.dto';
import { ApiResponse as ApiResponseDto, ExceptionHandler } from '@libs/common';

/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication operations.
 * Provides endpoints for user login and token generation.
 *
 * @route /auth
 * @tags Authentication
 *
 * @security
 * All endpoints in this controller are PUBLIC (no auth required).
 * After successful login, clients receive a JWT token for accessing
 * protected endpoints.
 *
 * @see AuthenticationService for business logic
 * @see JwtAuthGuard for protecting other endpoints
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  /**
   * User Login Endpoint
   *
   * Authenticates a user with mobile number and password, returning a JWT token
   * upon successful authentication. This token must be included in the Authorization
   * header for all protected endpoints.
   *
   * @route POST /auth/login
   * @access Public
   *
   * @param request - Login credentials containing mobile and password
   * @returns Login response with user data and JWT token
   *
   * @throws 401 - Invalid credentials or disabled account
   *
   * @example Request
   * ```json
   * POST /auth/login
   * {
   *   "mobile": "9764233336",
   *   "password": "Alben@123"
   * }
   * ```
   *
   * @example Success Response (200)
   * ```json
   * {
   *   "success": true,
   *   "message": "Welcome John Doe!",
   *   "data": {
   *     "id": "5",
   *     "firstname": "John",
   *     "lastname": "Doe",
   *     "mobile": "9764233336",
   *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "activity_status": "Check Out"
   *   }
   * }
   * ```
   *
   * @see AuthenticationService.login for implementation details
   */
  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with mobile and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginRequestDto,
  ): Promise<ApiResponseDto<LoginResponseDataDto>> {
    try {
      return await this.authService.login(request);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Forgot Password Endpoint
   *
   * Initiates password reset flow by sending OTP to user's mobile/email.
   *
   * @route POST /auth/forgot-password
   * @access Public
   */
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Request password reset OTP',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'User not found or inactive' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() request: ForgotPasswordRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.authService.forgotPassword(request.mobile);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Reset Password Endpoint
   *
   * Resets user's password using OTP and new password.
   *
   * @route POST /auth/reset-password
   * @access Public
   *
   * @param request - Contains mobile, OTP, and new password
   * @returns Success message upon password reset
   *
   * @throws 400 - Validation errors, invalid OTP, or user not found
   */
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset user password using OTP',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation errors / Invalid OTP / User not found',
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() request: ResetPasswordRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.authService.resetPassword(request);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
  /**
   * Verify Access Token Endpoint
   *
   * Checks if the current bearer token is valid and user has active company.
   *
   * @route POST /auth/verify-token
   * @access Protected (Requires Bearer Token)
   */
  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify Access Token',
    description: 'Check if token and user status are valid',
  })
  @ApiResponse({ status: 200, description: 'Granted' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @HttpCode(HttpStatus.OK)
  async verifyAccessToken(
    @User() user: { id: number },
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.authService.verifyAccessToken(user.id);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Generate OTP Endpoint
   *
   * Generates a 6-digit OTP for mobile verification.
   *
   * @route POST /auth/generate-otp
   * @access Protected (Requires Bearer Token)
   */
  @Post('generate-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate OTP',
    description: 'Generate OTP for mobile verification',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @HttpCode(HttpStatus.OK)
  async generateOTP(
    @Body() request: GenerateOtpRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.authService.generateOTP(request);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Verify OTP Endpoint
   *
   * Verifies the 6-digit OTP for mobile verification.
   *
   * @route POST /auth/verify-otp
   * @access Protected (Requires Bearer Token)
   */
  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify OTP for mobile verification',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @HttpCode(HttpStatus.OK)
  async verifyOTP(
    @Body() request: VerifyOtpRequestDto,
  ): Promise<ApiResponseDto<unknown>> {
    try {
      return await this.authService.verifyOTP(request);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

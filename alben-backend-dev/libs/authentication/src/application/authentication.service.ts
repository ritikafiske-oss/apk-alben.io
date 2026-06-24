import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService, USER_REPOSITORY } from '@libs/users';
import { NotificationsService } from '@libs/notifications';
import type { UserRepositoryPort } from '@libs/users';
import { OtpEntity } from '../infrastructure/persistence/entities/otp.entity';
import { LoginRequestDto } from '../ui/dtos/login-request.dto';
import {
  LoginResponseDto,
  LoginResponseDataDto,
} from '../ui/dtos/login-response.dto';
import { ResetPasswordRequestDto } from '../ui/dtos/reset-password-request.dto';
import { AuthGenericResponse } from '../ui/dtos/auth-generic-response.dto';
import { GenerateOtpRequestDto } from '../ui/dtos/generate-otp-request.dto';
import { VerifyOtpRequestDto } from '../ui/dtos/verify-otp-request.dto';

/**
 * Authentication Service
 *
 * Handles user authentication operations including login, token generation,
 * and session management. Implements Laravel-compatible login logic with
 * single device enforcement.
 *
 * @security Features
 * - Password validation using bcrypt
 * - JWT token generation and storage
 * - Single device login enforcement
 * - Active company association validation
 * - Last login date tracking
 *
 * @see JwtStrategy for token validation logic
 * @see UserService for credential validation
 */
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  /**
   * User Login
   *
   * Authenticates a user and generates a JWT token. This implementation
   * matches Laravel's login behavior for API compatibility.
   *
   * @param request - Login credentials (mobile and password)
   * @returns Login response with user data and JWT token
   * @throws UnauthorizedException if credentials are invalid or account is disabled
   *
   * @flow Login Process
   * 1. Validate mobile number and password against database
   * 2. Check if user has an active company association
   * 3. Generate JWT token with user ID and mobile
   * 4. Store token in database (overwrites previous token for single device login)
   * 5. Update last login date for audit tracking
   * 6. Fetch activity status from user_company table
   * 7. Return user data with token
   *
   * @security Single Device Login
   * Storing the token in the database ensures that when a user logs in from
   * a new device, their previous session is automatically invalidated. The
   * JwtStrategy validates incoming tokens against the stored token.
   */
  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    // Step 1: Validate user credentials (mobile and password)
    const user = await this.userService.validateUser(
      request.mobile,
      request.password,
    );

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        code: 'ERR_INVALID_CREDENTIALS',
        message: 'Invalid mobile number or password.',
        data: {},
      });
    }

    // Step 2: Check if user has an active company association
    const userCompanies = await this.userRepository.findActiveUserCompanies(
      user.id,
    );

    if (!userCompanies || userCompanies.length === 0) {
      throw new UnauthorizedException({
        success: false,
        code: 'ERR_ACCOUNT_DISABLED',
        message:
          'Your account has been disabled. Please contact your administrator for details.',
        data: {},
      });
    }

    // Step 2.1: Restrict 'all_in_one' (Admin) users from logging in
    const hasNonAllInOneRole = userCompanies.some(
      (uc) => uc.role !== 'all_in_one',
    );
    if (!hasNonAllInOneRole) {
      throw new UnauthorizedException({
        success: false,
        code: 'ERR_FORBIDDEN_ROLE',
        message: 'Admins are not allowed to login.',
        data: {},
      });
    }

    // Step 3: Generate JWT Token
    const payload = { sub: user.id, mobile: user.mobile };
    const token = this.jwtService.sign(payload);
    const fcmToken = request.fcm_token ?? null;

    // Step 4: Store token in database for single device enforcement
    await this.userRepository.updateApiToken(user.id, token);

    // Step 5: Update last login date for audit and tracking purposes
    await this.userRepository.updateLastLoginDate(user.id);

    if (fcmToken) {
      await this.userRepository.updateFcmToken(user.id, fcmToken);
    }

    // Step 6: Map user data to response DTO
    const data: LoginResponseDataDto = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname || '',
      mobile: user.mobile || '',
      is_reset_password: user.isResetPassword ? 1 : 0,
      token: token,
    };

    return {
      success: true,
      code: 'LOGIN_SUCCESS',
      message: `Welcome ${user.firstname} ${user.lastname || ''}!`,
      data: data,
    };
  }

  /**
   * Forgot Password
   *
   * Initiates the password reset process by generating an OTP and sending it
   * via SMS and Email (if available). Matches Laravel's logic exactly.
   *
   * @param mobile - User's mobile number
   * @returns Success message
   * @throws BadRequestException if user not found or inactive
   */
  async forgotPassword(mobile: string): Promise<AuthGenericResponse> {
    // 1. Validate User Existence
    const user = await this.userService.findByMobile(mobile);

    if (!user) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_USER_NOT_FOUND',
        message: "We can't find a user with that mobile number.",
        data: {},
      });
    }

    // 2. Check Active Status
    const userCompany = await this.userRepository.getUserCompanyByUserId(
      user.id,
    );
    const isActive = userCompany && userCompany.status === 'active';

    if (!isActive) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_ACCOUNT_DISABLED',
        message:
          'Your account has been disabled. Please contact your administrator for details.',
        data: {},
      });
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Handle Mobile OTP
    const lastOtp = await this.otpRepository.findOne({
      where: { mobile: mobile, status: 'active' },
      order: { createdAt: 'DESC' },
    });

    let smsApiRoute = 0;
    if (lastOtp) {
      smsApiRoute = lastOtp.changeSmsApi === 0 ? 1 : 0;
    }

    // Expire old generic mobile OTPs
    await this.otpRepository.update({ mobile: mobile }, { status: 'expired' });

    // Save new Mobile OTP
    const newMobileOtp = this.otpRepository.create({
      mobile: mobile,
      mobileOtp: otp,
      changeSmsApi: smsApiRoute,
      status: 'active',
    });
    await this.otpRepository.save(newMobileOtp);

    // 5. Handle Email OTP (if email exists)
    if (user.email) {
      await this.otpRepository.update(
        { email: user.email },
        { status: 'expired' },
      );

      const newEmailOtp = this.otpRepository.create({
        email: user.email,
        emailOtp: otp,
        status: 'active',
      });
      await this.otpRepository.save(newEmailOtp);

      // Send Email
      const resetUrl = `https://alben.io/reset-password/${mobile}`;
      const templateData = {
        app_name: 'Alben',
        first_name: user.firstname,
        last_name: user.lastname || '',
        otp: otp,
        resetPasswordUrl: resetUrl,
      };

      await this.notificationsService.sendTemplatedEmail(
        user.email,
        'forgot_password_mobile_user',
        templateData,
      );
    }

    // 6. Send SMS
    const hash = this.configService.get<string>('SMS_HASH', '4tJZRAcbx71');
    await this.notificationsService.sendSMS(
      mobile,
      `Welcome to Alben by Logic Innovates! \n${otp} is your OTP to reset your password. Do not share this with anyone else. ${hash}`,
    );

    return {
      success: true,
      code: 'OTP_SENT',
      message: 'OTP sent on your number.',
      data: [],
    };
  }

  /**
   * Reset Password
   *
   * Verifies OTP and updates user password.
   *
   * @param request - DTO containing mobile, otp, password, confirm_password
   * @returns Success message
   */
  async resetPassword(
    request: ResetPasswordRequestDto,
  ): Promise<AuthGenericResponse> {
    const user = await this.userService.findByMobile(request.mobile);

    if (!user) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_USER_NOT_FOUND',
        message: "We can't find a user with that mobile number.",
        data: {},
      });
    }

    const userCompany = await this.userRepository.getUserCompanyByUserId(
      user.id,
    );
    const isActive = userCompany && userCompany.status === 'active';

    if (!isActive) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_ACCOUNT_DISABLED',
        message:
          'Your account has been disabled. Please contact your administrator for details.',
        data: {},
      });
    }

    const checkOTP = await this.otpRepository.findOne({
      where: {
        mobile: request.mobile,
        mobileOtp: request.otp,
        status: 'active',
      },
    });

    if (!checkOTP) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_INVALID_OTP',
        message: 'The OTP you entered is incorrect.',
        data: {},
      });
    }

    checkOTP.status = 'expired';
    checkOTP.isVerified = true;
    await this.otpRepository.save(checkOTP);

    const hashedPassword = await bcrypt.hash(request.password, 10);
    await this.userRepository.updatePassword(user.id, hashedPassword, true);

    return {
      success: true,
      code: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset successfully!',
      data: null,
    };
  }

  /**
   * Verify Access Token
   *
   * Checks if the user's access token is valid and if they have an active
   * company association. Revokes token if invalid.
   *
   * @param userId - ID of the authenticated user
   * @returns Success message or throws 401
   */
  async verifyAccessToken(userId: number): Promise<AuthGenericResponse> {
    const userCompany =
      await this.userRepository.getUserCompanyByUserId(userId);
    const isActive = userCompany && userCompany.status === 'active';

    if (isActive) {
      return {
        success: true,
        code: 'TOKEN_VALID',
        message: 'Granted',
        data: null,
      };
    }

    // Revoke token if not active
    await this.userRepository.updateApiToken(userId, null);
    throw new UnauthorizedException({
      success: false,
      code: 'UNAUTHENTICATED',
      message: 'Unauthenticated.',
      data: {},
    });
  }

  /**
   * Generate OTP for Mobile Verification
   *
   * Generates a 6-digit OTP and sends it via SMS for mobile verification.
   *
   * @param request - DTO containing mobile number
   * @returns Success message
   */
  async generateOTP(
    request: GenerateOtpRequestDto,
  ): Promise<AuthGenericResponse> {
    const { mobile } = request;

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Expire old OTPs for this mobile
    await this.otpRepository.update({ mobile: mobile }, { status: 'expired' });

    // 3. Save new Mobile OTP
    const newOtp = this.otpRepository.create({
      mobile: mobile,
      mobileOtp: otp,
      status: 'active',
      isVerified: false,
    });
    await this.otpRepository.save(newOtp);

    // 4. Send SMS
    const hash = this.configService.get<string>('SMS_HASH', '4tJZRAcbx71');
    const message = `Welcome to Alben by Logic Innovates! \nTo verify your phone number with Alben your OTP is ${otp}. Do not share this with anyone else. ${hash}`;
    await this.notificationsService.sendSMS(mobile, message);

    return {
      success: true,
      code: 'OTP_SENT',
      message: 'OTP sent on your number.',
      data: [],
    };
  }

  /**
   * Verify OTP for Mobile Verification
   *
   * Verifies the 6-digit OTP and marks the record as verified.
   *
   * @param request - DTO containing mobile and otp
   * @returns Success message or throws BadRequestException
   */
  async verifyOTP(request: VerifyOtpRequestDto): Promise<AuthGenericResponse> {
    const { mobile, otp } = request;

    const checkOTP = await this.otpRepository.findOne({
      where: {
        mobile: mobile,
        mobileOtp: otp,
        status: 'active',
      },
    });

    if (!checkOTP) {
      throw new BadRequestException({
        success: false,
        error: true,
        code: 'ERR_INVALID_OTP',
        message: 'Enter the correct OTP.',
        data: {},
      });
    }

    // Mark as verified
    checkOTP.isVerified = true;
    await this.otpRepository.save(checkOTP);

    return {
      success: true,
      code: 'OTP_VERIFIED_SUCCESS',
      message: 'OTP is verified successfully!',
      data: [],
    };
  }
}

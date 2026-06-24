import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GetUserProfileUseCase } from '../application/get-user-profile.usecase';
import { GetUserCompaniesUseCase } from '../application/get-user-companies.usecase';
import { GetUserConfigUseCase } from '../application/get-user-config.usecase';
import { GetAppVersionUseCase } from '../application/get-app-version.usecase';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.usecase';
import { GetNotificationsUseCase } from '../application/get-notifications.usecase';
import { AuthService } from '../application/auth.service';
import { UserProfileDto } from './dtos/user-profile.dto';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import {
  GetNotificationsDto,
  NotificationResponseDto,
} from './dtos/get-notifications.dto';
import { CompanyDto } from './dtos/company.dto';
import { UserConfigDto } from './dtos/user-config.dto';
import { AppVersionDto } from './dtos/app-version.dto';
import {
  JwtAuthGuard,
  ApiResponse as ApiResponseDto,
  User,
  ExceptionHandler,
} from '@libs/common';
import { ActiveCompanyGuard } from '../application/guards/active-company.guard';

/**
 * Users Controller
 *
 * Handles HTTP requests for user-related operations.
 * All endpoints in this controller are PROTECTED and require JWT authentication.
 *
 * @route /users
 * @tags Users
 *
 * @security JwtAuthGuard
 * All endpoints require a valid JWT token in the Authorization header:
 * ```
 * Authorization: Bearer <token>
 * ```
 *
 * @see JwtAuthGuard for authentication logic
 * @see GetUserProfileUseCase for profile logic
 * @see GetUserCompaniesUseCase for companies logic
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getUserCompaniesUseCase: GetUserCompaniesUseCase,
    private readonly getUserConfigUseCase: GetUserConfigUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly authService: AuthService,
    private readonly getAppVersionUseCase: GetAppVersionUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
  ) {}

  /**
   * Get User Profile
   *
   * Retrieves the profile information for the currently authenticated user.
   * Uses the user ID extracted from the JWT token.
   *
   * @route GET /users/profile
   * @access Protected - Requires JWT authentication
   *
   * @param user - Authenticated user extracted from JWT (injected by @User decorator)
   * @returns User profile with personal information and activity status
   *
   * @example Request
   * ```
   * GET /users/profile
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   *
   * @example Response (200)
   * ```json
   * {
   *   "success": true,
   *   "message": "Profile fetched successfully.",
   *   "data": {
   *     "id": "5",
   *     "firstname": "John",
   *     "lastname": "Doe",
   *     "mobile": "9764233336",
   *     "email": "john@example.com",
   *     "activity_status": "Check Out"
   *   }
   * }
   * ```
   *
   * @throws 401 - Unauthorized if token is missing or invalid
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully.' })
  async getProfile(
    @User() user: { id: number },
  ): Promise<ApiResponseDto<UserProfileDto>> {
    try {
      // Extract user ID from JWT token (set by JwtStrategy)
      return await this.getUserProfileUseCase.execute(user.id);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Get User Companies
   *
   * Retrieves all companies associated with the currently authenticated user.
   * Returns company details for companies where the user has an active role.
   *
   * @route GET /users/companies
   * @access Protected - Requires JWT authentication
   *
   * @param user - Authenticated user extracted from JWT (injected by @User decorator)
   * @returns Array of companies associated with the user
   *
   * @example Request
   * ```
   * GET /users/companies
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   *
   * @example Response (200)
   * ```json
   * {
   *   "success": true,
   *   "message": "Companies fetched successfully.",
   *   "data": [
   *     {
   *       "id": 1,
   *       "name": "Acme Corp",
   *       "address": "123 Main St"
   *     }
   *   ]
   * }
   * ```
   *
   * @throws 401 - Unauthorized if token is missing or invalid
   */
  @Get('companies')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user companies' })
  @ApiResponse({ status: 200, description: 'Companies fetched successfully.' })
  async getCompanies(
    @User() user: { id: number },
  ): Promise<ApiResponseDto<CompanyDto[]>> {
    try {
      // Extract user ID from JWT token (set by JwtStrategy)
      return await this.getUserCompaniesUseCase.execute(user.id);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Get User Config
   *
   * Retrieves user configuration for a specific company.
   */
  @Get('get-config')
  @UseGuards(JwtAuthGuard, ActiveCompanyGuard)
  @ApiOperation({ summary: 'Get user config' })
  @ApiQuery({ name: 'company_id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Config fetched successfully.' })
  async getConfig(
    @User() user: { id: number },
    @Query('company_id') companyId: number,
  ): Promise<ApiResponseDto<UserConfigDto>> {
    try {
      return await this.getUserConfigUseCase.execute(user.id, companyId);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Get App Version
   *
   * Retrieves the active app version record.
   * Returns version, description, and is_force flag.
   *
   * @route GET /users/app-version
   * @access Public - No authentication required
   *
   * @returns Active app version data (or null if none exists)
   *
   * @example Response (200)
   * ```json
   * {
   *   "success": true,
   *   "message": "App version fetched successfully.",
   *   "data": {
   *     "version": "1.0.0",
   *     "description": "Initial release",
   *     "is_force": 0
   *   }
   * }
   * ```
   */
  @Get('app-version')
  @ApiOperation({ summary: 'Get active app version' })
  @ApiResponse({
    status: 200,
    description: 'App version fetched successfully.',
  })
  async getAppVersion(): Promise<ApiResponseDto<AppVersionDto | null>> {
    try {
      return await this.getAppVersionUseCase.execute();
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Update User Profile
   *
   * Updates the authenticated user's profile information.
   * Validates firstname, lastname, email, mobile, and profile image.
   *
   * @route POST /users/update-profile
   * @access Protected - Requires JWT authentication
   *
   * @param user - Authenticated user extracted from JWT
   * @param dto - Profile update data (firstname, lastname, email, mobile, profile_image)
   * @returns Success message and updated profile data
   *
   * @example Request
   * ```json
   * {
   *   "firstname": "John",
   *   "lastname": "Doe",
   *   "email": "john@example.com",
   *   "mobile": "9764233311"
   * }
   * ```
   *
   * @throws 400 - Validation Error
   * @throws 409 - Conflict (email/mobile taken)
   */
  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Email or mobile already taken.',
  })
  async updateProfile(
    @User() user: { id: number },
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ApiResponseDto<UserProfileDto>> {
    try {
      return await this.updateUserProfileUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  /**
   * Get Notifications
   *
   * Retrieves paginated notifications for the authenticated user and a specific company.
   *
   * @route GET /users/notifications
   * @access Protected - Requires JWT authentication
   *
   * @param user - Authenticated user
   * @param dto - Query parameters (company_id, page, limit)
   * @returns Paginated notifications and unread count
   */
  @Get('notifications')
  @UseGuards(JwtAuthGuard, ActiveCompanyGuard)
  @ApiOperation({ summary: 'Get notifications' })
  @ApiQuery({ name: 'company_id', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 200 })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully.',
    type: NotificationResponseDto,
  })
  async getNotifications(
    @User() user: { id: number },
    @Query() dto: GetNotificationsDto,
  ): Promise<ApiResponseDto<NotificationResponseDto>> {
    try {
      return await this.getNotificationsUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}

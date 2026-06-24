import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './ui/users.controller';
import { GetUserProfileUseCase } from './application/get-user-profile.usecase';
import { GetUserCompaniesUseCase } from './application/get-user-companies.usecase';
import { GetUserConfigUseCase } from './application/get-user-config.usecase';
import { GetAppVersionUseCase } from './application/get-app-version.usecase';
import { UpdateUserProfileUseCase } from './application/update-user-profile.usecase';
import { AuthService } from './application/auth.service';
import { UserService } from './application/user.service';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { CompanyEntity } from './infrastructure/persistence/entities/company.entity';
import { UserCompanyEntity } from './infrastructure/persistence/entities/user-company.entity';
import { BusinessSettingEntity } from './infrastructure/persistence/entities/business-setting.entity';
import { AppVersionEntity } from './infrastructure/persistence/entities/app-version.entity';
import { SubscriptionGateway } from './infrastructure/gateways/subscription.gateway';
import { ActiveCompanyGuard } from './application/guards/active-company.guard';
import { NotificationEntity } from './infrastructure/persistence/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from './domain/ports/notification.repository.port';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { GetNotificationsUseCase } from './application/get-notifications.usecase';

/**
 * Users Module
 *
 * Manages user-related functionality including:
 * - User profile retrieval
 * - User companies management
 * - User authentication and validation
 * - User repository operations
 *
 * @architecture Hexagonal/Clean Architecture
 * - Domain: Business entities and repository ports
 * - Application: Use cases and services
 * - Infrastructure: Database entities and repository implementation
 * - UI: Controllers and DTOs
 *
 * @exports
 * - AuthService: For session validation
 * - UserService: For user credential validation
 * - USER_REPOSITORY: Repository port for dependency injection
 *
 * @controllers
 * - UsersController: Protected endpoints for user data
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CompanyEntity,
      UserCompanyEntity,
      BusinessSettingEntity,
      AppVersionEntity,
      NotificationEntity,
    ]),
    JwtModule.register({}), // Default setup
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserCompaniesUseCase,
    GetUserConfigUseCase,
    GetAppVersionUseCase,
    AuthService,
    UserService,
    SubscriptionGateway,
    ActiveCompanyGuard,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepository,
    },
    GetNotificationsUseCase,
  ],
  exports: [
    AuthService,
    UserService,
    USER_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    ActiveCompanyGuard,
  ], // Exporting AuthService if other modules need to validate session
})
export class UsersModule {}

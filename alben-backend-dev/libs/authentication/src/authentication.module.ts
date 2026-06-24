import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '@libs/notifications';
import { OtpEntity } from './infrastructure/persistence/entities/otp.entity';
import { AuthenticationService } from './application/authentication.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthenticationController } from './ui/authentication.controller';
import { UsersModule } from '@libs/users';

/**
 * Authentication Module
 *
 * Provides authentication functionality for the application including:
 * - User login with mobile and password
 * - JWT token generation and validation
 * - Single device login enforcement
 * - Passport integration for route protection
 *
 * @dependencies
 * - UsersModule: For user validation and repository access
 * - PassportModule: For strategy-based authentication
 * - JwtModule: For JWT token signing and verification
 *
 * @exports
 * - AuthenticationService: For login functionality
 * - JwtStrategy: For token validation (used by guards)
 *
 * @controllers
 * - AuthenticationController: Exposes POST /auth/login endpoint
 *
 * @configuration
 * JWT Configuration:
 * - Secret: JWT_SECRET environment variable or 'SECRET_KEY' fallback
 * - Expiration: JWT_EXPIRY environment variable (default: 1y)
 * - Default Strategy: 'jwt' for Passport
 */
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Use registerAsync to ensure ConfigModule has loaded .env before accessing JWT_SECRET
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'SECRET_KEY',
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRY',
            '1y',
          ) as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
        },
      }),
    }),
    TypeOrmModule.forFeature([OtpEntity]),
    NotificationsModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService, JwtStrategy],
})
export class AuthenticationModule {}

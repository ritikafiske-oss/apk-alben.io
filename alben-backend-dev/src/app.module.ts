import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiLoggerInterceptor } from '../libs/common/src/interceptors/api-logger.interceptor';
import { AllExceptionsFilter } from '../libs/common/src/filters/all-exceptions.filter';
import { ResponseMappingInterceptor } from '../libs/common/src/interceptors/response-mapping.interceptor';
import { CommonModule } from '../libs/common';
import { UsersModule } from '../libs/users/index';
import { AuthenticationModule } from '../libs/authentication/index';
import { ProductsModule } from '../libs/products';
import { ContactsModule } from '../libs/contacts';
import { ContactStatusModule } from '../libs/contact-status';
import { NotesModule } from '../libs/notes';
import { VisitsModule } from '../libs/visits';
import { LocalizationModule } from '@libs/localization';
import { StorageModule } from '../libs/storage';
import { DashboardModule } from '../libs/dashboard';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { HealthModule } from '../libs/health';
import { LocationsModule } from '../libs/locations/index';
import { ServicesModule } from '../libs/services';
import { ReportsModule } from '../libs/reports';

/**
 * Application Root Module
 *
 * Main entry point for the NestJS application.
 * Configures database connection, environment variables, and imports all feature modules.
 *
 * @module AppModule
 *
 * @configuration
 * - Environment: Loaded from .env file via ConfigModule
 * - Database: MySQL connection via TypeORM
 * - Modules: CommonModule, AuthenticationModule, UsersModule
 *
 * @database TypeORM Configuration
 * - Type: MySQL
 * - Host: DB_HOST environment variable (default: localhost)
 * - Port: DB_PORT environment variable (default: 3306)
 * - Database: DB_NAME environment variable (default: alben_database)
 * - Synchronize: **DISABLED** to prevent schema changes
 * - Logging: Enabled for development debugging
 *
 * @security Database Schema Protection
 * **CRITICAL**: synchronize is set to false to prevent TypeORM from automatically
 * modifying the database schema. With an existing Laravel database, enabling
 * synchronize would drop columns not defined in entities.
 *
 * Always use migrations for schema changes:
 * ```bash
 * pnpm run migration:create MigrationName
 * pnpm run migration:run
 * ```
 *
 * @moduleImportOrder
 * 1. ConfigModule - Global environment configuration
 * 2. TypeOrmModule - Database connection
 * 3. CommonModule - Global guards and utilities
 * 4. AuthenticationModule - JWT authentication
 * 5. UsersModule - User management
 *
 * @see CommonModule for global guards
 * @see AuthenticationModule for login and JWT
 * @see UsersModule for user operations
 */
@Module({
  imports: [
    // Global configuration - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database configuration using async factory pattern
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_NAME', 'alben_database'),
          autoLoadEntities: true,

          // **CRITICAL**: synchronize is DISABLED to prevent data loss
          // TypeORM synchronize drops columns not defined in entities
          // Use migrations for schema changes instead
          synchronize: false,

          // Store and interpret all timestamps in UTC for consistent
          // behaviour across timezones
          timezone: 'UTC',

          migrations: [
            __dirname +
              '/../libs/**/infrastructure/persistence/migrations/*.js',
          ],
          migrationsTableName: 'schema_migrations',
          migrationsRun: false,

          logging: false,
        };

        // Log database config (hide password for security)
        // console.log('DB Config:', { ...config, password: '***' });
        return config;
      },
      inject: [ConfigService],
    }),

    // Feature modules
    CommonModule, // Global guards and utilities
    AuthenticationModule, // JWT authentication
    UsersModule, // User management
    ProductsModule,
    ContactsModule,
    ContactStatusModule,
    NotesModule,
    VisitsModule,
    LocalizationModule,
    StorageModule,
    DashboardModule,
    SystemLogsModule,
    HealthModule,
    LocationsModule,
    ServicesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMappingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

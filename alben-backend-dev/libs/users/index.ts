/**
 * Users Module Barrel Exports
 */
export * from './src/application/auth.service';
export * from './src/application/user.service';
export * from './src/application/guards/active-company.guard';
export * from './src/application/decorators/skip-active-company.decorator';
export * from './src/ui/dtos/user-profile.dto';
export * from './src/ui/dtos/company.dto';
export * from './src/ui/dtos/app-version.dto';
export * from './src/domain/ports/user.repository.port';
export { UserEntity } from './src/infrastructure/persistence/entities/user.entity';
export { UserCompanyEntity } from './src/infrastructure/persistence/entities/user-company.entity';
export { NOTIFICATION_REPOSITORY } from './src/domain/ports/notification.repository.port';
export type { NotificationRepositoryPort } from './src/domain/ports/notification.repository.port';
export { GetNotificationsUseCase } from './src/application/get-notifications.usecase';
export { GetNotificationsDto } from './src/ui/dtos/get-notifications.dto';

// Module export moved to bottom to ensure all decorators/guards are defined first
export * from './src/users.module';

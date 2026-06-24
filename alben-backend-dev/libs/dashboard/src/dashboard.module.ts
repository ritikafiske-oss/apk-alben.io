import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './ui/dashboard.controller';
import { GetDashboardMetricsUseCase } from './application/get-dashboard-metrics.use-case';
import { UserProductContactEntity, CallLogEntity } from '@libs/contacts';
import { NoteEntity } from '@libs/notes';
import { UsersModule } from '@libs/users';
import { LocationLogEntity } from '@libs/locations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProductContactEntity,
      NoteEntity,
      LocationLogEntity,
      CallLogEntity,
    ]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [GetDashboardMetricsUseCase],
  exports: [GetDashboardMetricsUseCase],
})
export class DashboardModule {}

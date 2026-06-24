import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@libs/common';
import { UsersModule } from '@libs/users';
import { ProductsModule } from '@libs/products';
import { ContactsModule } from '@libs/contacts';
import { VisitsModule } from '@libs/visits';
import { ReportsController } from './ui/reports.controller';
import {
  GetCallReportsUseCase,
  REPORTS_REPOSITORY,
} from './application/get-call-reports.usecase';
import { GetVisitReportsUseCase } from './application/get-visit-reports.usecase';
import { GetAttendanceReportUseCase } from './application/get-attendance-report.usecase';
import { ReportsRepository } from './infrastructure/persistence/repositories/reports.repository';
import { DistanceService } from './domain/distance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    CommonModule,
    UsersModule,
    forwardRef(() => ProductsModule),
    ContactsModule,
    VisitsModule,
  ],
  providers: [
    GetCallReportsUseCase,
    GetVisitReportsUseCase,
    GetAttendanceReportUseCase,
    DistanceService,
    {
      provide: REPORTS_REPOSITORY,
      useClass: ReportsRepository,
    },
  ],
  controllers: [ReportsController],
  exports: [
    GetCallReportsUseCase,
    GetVisitReportsUseCase,
    GetAttendanceReportUseCase,
  ],
})
export class ReportsModule {}

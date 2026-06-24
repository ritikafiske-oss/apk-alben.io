import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './ui/locations.controller';
import { ChangeStatusService } from './application/change-status.service';
import { SyncLocationsService } from './application/sync-locations.service';
import { LocationDecisionService } from './domain/location-decision.service';
import { LocationsRepository } from './infrastructure/persistence/locations.repository';
import { LOCATIONS_REPOSITORY } from './domain/ports/locations.repository.port';
import { UserLogEntity } from './infrastructure/persistence/entities/user-log.entity';
import { JobLocationEntity } from './infrastructure/persistence/entities/job-location.entity';
import { LocationLogEntity } from './infrastructure/persistence/entities/location-log.entity';
import { UserJobLocationEntity } from './infrastructure/persistence/entities/user-job-location.entity';
import { ShiftScheduleEntity } from './infrastructure/persistence/entities/shift-schedule.entity';
import { UsersModule } from '@libs/users';

/**
 * Locations Module
 *
 * Provides features for user check-in, check-out, and geofencing.
 * Exports ChangeStatusService for use in other modules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserLogEntity,
      JobLocationEntity,
      LocationLogEntity,
      UserJobLocationEntity,
      ShiftScheduleEntity,
    ]),
    UsersModule,
  ],
  controllers: [LocationsController],
  providers: [
    ChangeStatusService,
    SyncLocationsService,
    LocationDecisionService,
    {
      provide: LOCATIONS_REPOSITORY,
      useClass: LocationsRepository,
    },
  ],
  exports: [ChangeStatusService],
})
export class LocationsModule {}

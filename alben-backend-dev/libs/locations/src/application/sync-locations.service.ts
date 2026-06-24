import { Injectable, Inject } from '@nestjs/common';
import {
  LOCATIONS_REPOSITORY,
  type LocationsRepositoryPort,
} from '../domain/ports/locations.repository.port';
import {
  SyncLocationItemDto,
  SyncLocationsResponseDto,
} from '../ui/dtos/sync-locations.request.dto';
import { DateUtil } from '@libs/common';
import dayjs from 'dayjs';
import { LocationLogEntity } from '../infrastructure/persistence/entities/location-log.entity';
import { JobLocationEntity } from '../infrastructure/persistence/entities/job-location.entity';

@Injectable()
export class SyncLocationsService {
  constructor(
    @Inject(LOCATIONS_REPOSITORY)
    private readonly repository: LocationsRepositoryPort,
  ) {}

  async execute(
    userId: number,
    locations: SyncLocationItemDto[],
  ): Promise<SyncLocationsResponseDto> {
    const localTimeZone = 'Asia/Kolkata';
    const utcTimeZone = 'UTC';

    // 1. Convert all timestamps first (Laravel: $convertedTimestamps)
    const convertedTimestampsMap = new Map<number, Date>();
    locations.forEach((location, index) => {
      convertedTimestampsMap.set(
        index,
        DateUtil.getDateTimeAccordingTimezone(
          location.created_at,
          localTimeZone,
          utcTimeZone,
        ),
      );
    });

    // 2. Fetch existing logs from database with strict Laravel map quirk
    const allUtcDates = Array.from(convertedTimestampsMap.values());
    const existingLogsFromDb = await this.repository.findLocationLogsByDates(
      userId,
      allUtcDates,
    );

    const existingTimestampsSet = new Set(
      existingLogsFromDb.map((log) => {
        // STRICT Laravel Quirk: CommonHelper::getDateTimeAccordingTimezone(Carbon::parse($timestamp)->format('Y-m-d H:i:s'), 'Asia/Kolkata', 'UTC');
        const formatted = dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss');
        const shifted = DateUtil.getDateTimeAccordingTimezone(
          formatted,
          'Asia/Kolkata',
          'UTC',
        );
        return dayjs(shifted).format('YYYY-MM-DD HH:mm:ss');
      }),
    );

    // 3. Fetch Job Locations in bulk
    const companyIds = Array.from(new Set(locations.map((l) => l.company_id)));
    const userJobLocations =
      await this.repository.findUserJobLocationsByCompanyIds(
        userId,
        companyIds,
      );
    const jobLocationsMap = new Map<number, JobLocationEntity>(
      userJobLocations.map((ujl) => [
        ujl.jobLocation.company_id,
        ujl.jobLocation,
      ]),
    );

    // 4. Prepare insert data with duplicate prevention (Laravel logic)
    const insertData: Partial<LocationLogEntity>[] = [];
    const processedTimestamps = new Set<string>();

    locations.forEach((location, index) => {
      const createdAt = convertedTimestampsMap.get(index);
      const createdAtFormatted = dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss');

      // Skip if location already exists in database or already processed in this request
      if (
        existingTimestampsSet.has(createdAtFormatted) ||
        processedTimestamps.has(createdAtFormatted)
      ) {
        return;
      }

      processedTimestamps.add(createdAtFormatted);

      const jobLoc = jobLocationsMap.get(location.company_id);

      insertData.push({
        full_address: location.full_address ?? null,
        log_type: location.type ?? 'others',
        user_id: userId,
        company_id: location.company_id,
        latitude: location.latitude,
        longitude: location.longitude,
        location_error_log: location.location_error_log ?? null,
        user_device_values: location.user_device_values
          ? JSON.stringify(location.user_device_values)
          : null,
        user_job_location_latitude: jobLoc?.latitude ?? 0,
        user_job_location_longitude: jobLoc?.longitude ?? 0,
        user_job_location_radius: Number(jobLoc?.radius ?? 0),
        created_at: createdAt,
        updated_at: new Date(),
      });
    });

    const insertedCount =
      await this.repository.insertBulkLocationLogs(insertData);

    return {
      success: true,
      code: 'LOCATIONS_SYNC_SUCCESS',
      message: 'Locations synced successfully.',
      data: {
        total_locations_processed: locations.length,
        new_locations_inserted: insertedCount,
        duplicates_skipped: locations.length - insertedCount,
      },
    };
  }
}

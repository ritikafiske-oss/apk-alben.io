import { Injectable } from '@nestjs/common';
import { LocationLogRow } from './ports/reports.repository.port';

@Injectable()
export class DistanceService {
  /**
   * Calculates total distance travelled from a series of location logs.
   * Logic:
   * - Sequential calculation between consecutive points.
   * - Skip if the start point of a pair is 'check_out'.
   */
  public calculateTotalDistance(logs: LocationLogRow[]): number {
    let totalDistanceKm = 0;

    // Group logs by date to match Laravel's groupBy(DATE(created_at))
    const groupedByDate: Record<string, LocationLogRow[]> = {};
    for (const log of logs) {
      const dateKey = new Date(log.created_at).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(log);
    }

    // Process each day's logs independently
    for (const dateKey in groupedByDate) {
      const dayLogs = groupedByDate[dateKey];
      for (let i = 0; i < dayLogs.length - 1; i++) {
        const current = dayLogs[i];
        const next = dayLogs[i + 1];

        // Skip distance calculation if current log is a check_out
        if (current.log_type === 'check_out') {
          continue;
        }

        const distance = this.getHaversineDistance(
          current.latitude,
          current.longitude,
          next.latitude,
          next.longitude,
        );

        totalDistanceKm += distance;
      }
    }

    return parseFloat(totalDistanceKm.toFixed(2));
  }

  private getHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

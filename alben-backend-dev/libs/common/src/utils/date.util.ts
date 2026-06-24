import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class DateUtil {
  /**
   * Parses a given date/time string in a specific timezone and converts it to another timezone.
   * Matches PHP Laravel Carbon behavior: Carbon::parse($dateTime, $fromZone)->setTimezone($toZone)
   *
   * @param dateTime The date or date string to parse.
   * @param fromZone The source timezone (default: 'UTC').
   * @param toZone The target timezone (default: 'Asia/Kolkata').
   * @returns Date object representing the converted time.
   */
  public static getDateTimeAccordingTimezone(
    dateTime: string | Date,
    fromZone?: string,
    toZone?: string,
  ): Date;

  /**
   * Parses, converts and formats a date/time in a specific timezone.
   *
   * @param dateTime The date or date string to parse.
   * @param fromZone The source timezone.
   * @param toZone The target timezone.
   * @param format The output format.
   * @returns Formatted string representing the converted time.
   */
  public static getDateTimeAccordingTimezone(
    dateTime: string | Date,
    fromZone: string,
    toZone: string,
    format: string,
  ): string;

  public static getDateTimeAccordingTimezone(
    dateTime: string | Date,
    fromZone: string = 'UTC',
    toZone: string = 'Asia/Kolkata',
    format?: string,
  ): Date | string {
    const dayjsObj = dayjs.tz(dateTime, fromZone).tz(toZone);
    return format ? dayjsObj.format(format) : dayjsObj.toDate();
  }

  /**
   * Converts a date range array from IST ('Asia/Kolkata') to UTC.
   *
   * @param dateRange Array containing two dates.
   * @returns Array with both dates converted to UTC.
   */
  public static convertDateRangeISTtoUTC(
    dateRange: [string | Date, string | Date],
  ): [Date, Date] {
    const startDate = this.getDateTimeAccordingTimezone(
      dateRange[0],
      'Asia/Kolkata',
      'UTC',
    );
    const endDate = this.getDateTimeAccordingTimezone(
      dateRange[1],
      'Asia/Kolkata',
      'UTC',
    );

    return [startDate, endDate];
  }

  /**
   * Formats a date/time into a specific string format.
   *
   * @param dateTime The date or date string to format.
   * @param format The format string (default: 'YYYY-MM-DD HH:mm:ss').
   * @returns Formatted date string.
   */
  public static format(
    dateTime: string | Date,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    return dayjs(dateTime).format(format);
  }
}

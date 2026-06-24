import { DateUtil } from '../src/utils/date.util';

describe('DateUtil', () => {
  describe('getDateTimeAccordingTimezone', () => {
    it('should convert UTC to Asia/Kolkata correctly', () => {
      const utcDateStr = '2024-01-01T12:00:00Z'; // 12:00 PM UTC
      const result = DateUtil.getDateTimeAccordingTimezone(
        utcDateStr,
        'UTC',
        'Asia/Kolkata',
      );

      // A native JS Date object represents a fixed point in time.
      // So 12:00 UTC converted to Asia/Kolkata is still 12:00 UTC absolute time.
      // The timezone formatting is only visible if formatted using dayjs again.
      expect(result.getUTCHours()).toBe(12);
      expect(result.getUTCMinutes()).toBe(0);
    });

    it('should convert Asia/Kolkata to UTC correctly', () => {
      // 5:30 PM IST
      const istDateStr = '2024-01-01T17:30:00';
      const result = DateUtil.getDateTimeAccordingTimezone(
        istDateStr,
        'Asia/Kolkata',
        'UTC',
      );

      // Expecting 12:00 PM UTC. Since `.toDate()` returns a native Date
      // which is inherently a point in time (often printed in local time),
      // we check the UTC values.
      expect(result.getUTCHours()).toBe(12);
      expect(result.getUTCMinutes()).toBe(0);
    });
  });

  describe('convertDateRangeISTtoUTC', () => {
    it('should convert an array of two IST dates to UTC dates', () => {
      const startIst = '2025-05-10T00:00:00'; // midnight IST
      const endIst = '2025-05-15T23:59:59'; // end of day IST

      const [utcStart, utcEnd] = DateUtil.convertDateRangeISTtoUTC([
        startIst,
        endIst,
      ]);

      // Midnight IST is previous day 6:30 PM UTC
      expect(utcStart.getUTCHours()).toBe(18);
      expect(utcStart.getUTCMinutes()).toBe(30);
      expect(utcStart.getUTCDate()).toBe(9); // previous day

      // 23:59:59 IST is same day 18:29:59 UTC
      expect(utcEnd.getUTCHours()).toBe(18);
      expect(utcEnd.getUTCMinutes()).toBe(29);
      expect(utcEnd.getUTCSeconds()).toBe(59);
      expect(utcEnd.getUTCDate()).toBe(15);
    });
  });
});

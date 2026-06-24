import dayjs from 'dayjs';
import { FilterByEnum } from '../ui/dtos/get-reports-query.dto';

export class ReportDateHelper {
  public static getStartAndEndDates(
    filterBy: FilterByEnum,
    startDateStr?: string,
    endDateStr?: string,
  ): { startDate: Date; endDate: Date } {
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;

    switch (filterBy) {
      case FilterByEnum.TODAY:
        startDate = dayjs().startOf('day');
        endDate = dayjs().endOf('day');
        break;
      case FilterByEnum.YESTERDAY:
        startDate = dayjs().subtract(1, 'day').startOf('day');
        endDate = dayjs().subtract(1, 'day').endOf('day');
        break;
      case FilterByEnum.THIS_WEEK:
        startDate = dayjs().startOf('week');
        endDate = dayjs().endOf('week');
        break;
      case FilterByEnum.PREVIOUS_WEEK:
        startDate = dayjs().subtract(1, 'week').startOf('week');
        endDate = dayjs().subtract(1, 'week').endOf('week');
        break;
      case FilterByEnum.THIS_MONTH:
        startDate = dayjs().startOf('month');
        endDate = dayjs().endOf('month');
        break;
      case FilterByEnum.PREVIOUS_MONTH:
        startDate = dayjs().subtract(1, 'month').startOf('month');
        endDate = dayjs().subtract(1, 'month').endOf('month');
        break;
      case FilterByEnum.THIS_YEAR:
        startDate = dayjs().startOf('year');
        endDate = dayjs().endOf('year');
        break;
      case FilterByEnum.CUSTOM_DATE:
      default:
        startDate = startDateStr
          ? dayjs(startDateStr).startOf('day')
          : dayjs().startOf('day');
        endDate = endDateStr
          ? dayjs(endDateStr).endOf('day')
          : dayjs().endOf('day');
        break;
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    };
  }
}

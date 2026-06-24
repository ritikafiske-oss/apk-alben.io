import { GetCallLogsDto } from '../../ui/dtos/get-call-logs.dto';
import { CallLogEntity } from '../../infrastructure/persistence/entities/call-log.entity';
import { CallLogProductDetailEntity } from '../../infrastructure/persistence/entities/call-log-product-detail.entity';

export abstract class CallLogRepositoryPort {
  abstract getCallLogs(
    userId: number,
    dto: GetCallLogsDto,
  ): Promise<{
    current_page: number;
    total_pages: number;
    total_items: number;
    records: unknown[];
  }>;

  abstract createCallLog(data: Partial<CallLogEntity>): Promise<CallLogEntity>;

  abstract findExistingCallLog(
    contactId: number,
    mobile: string,
    startCallAt: Date,
    duration: number | string,
    userId: number,
  ): Promise<CallLogEntity | null>;

  abstract findLastCallLog(contactId: number): Promise<CallLogEntity | null>;
  abstract findById(id: number): Promise<CallLogEntity | null>;
  abstract updateCallLog(
    id: number,
    data: Partial<CallLogEntity>,
  ): Promise<void>;
  abstract createCallLogProductDetail(
    data: Partial<CallLogProductDetailEntity>,
  ): Promise<void>;
}

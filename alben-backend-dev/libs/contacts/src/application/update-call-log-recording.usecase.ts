import { Injectable, Inject } from '@nestjs/common';
import type { CallLogRepositoryPort } from '../domain/ports/call-log.repository.port';
import { CALL_LOG_REPOSITORY } from './get-call-logs.usecase';
import { UpdateCallLogRecordingRequestDto } from '../ui/dtos/update-call-log-recording.dto';
import { ApiResponse, ExceptionHandler } from '@libs/common';

@Injectable()
export class UpdateCallLogRecordingUseCase {
  constructor(
    @Inject(CALL_LOG_REPOSITORY)
    private readonly callLogRepo: CallLogRepositoryPort,
  ) {}

  async execute(
    userId: number,
    dto: UpdateCallLogRecordingRequestDto,
  ): Promise<ApiResponse<unknown>> {
    const { call_log_id, recording_url } = dto;

    // 1. Verify call log exists
    const callLog = await this.callLogRepo.findById(call_log_id);
    if (!callLog) {
      return {
        success: false,
        code: 'CALL_LOG_NOT_FOUND',
        message: 'Call log not found.',
        data: null,
      };
    }

    // 2. Update recording url
    try {
      await this.callLogRepo.updateCallLog(call_log_id, {
        recording_url: recording_url,
      });

      return {
        success: true,
        code: 'RECORDING_UPDATED',
        message: 'Recording updated successfully.',
        data: null,
      };
    } catch (err) {
      ExceptionHandler.handleAndThrow(err);
    }
  }
}

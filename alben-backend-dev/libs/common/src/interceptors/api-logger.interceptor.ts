import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DynamicLoggerService } from '../logger/dynamic-logger.service';
import { Request, Response } from 'express';

@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: DynamicLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { originalUrl } = request;

    // Ignore visual web endpoints (Swagger UI and System Logs Dashboard)
    if (
      originalUrl.startsWith('/system-logs-view') ||
      (originalUrl.startsWith('/api') && !originalUrl.startsWith('/api/v'))
    ) {
      return next.handle();
    }

    // Time in seconds to match microtime(true)
    const startTimeStamp = Date.now() / 1000;

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logApiRequest(request, response, data, startTimeStamp);
        },
        error: (err: unknown) => {
          const errorObj = err as Record<string, unknown>;
          this.logApiRequest(
            request,
            response,
            errorObj?.response || errorObj?.message || null,
            startTimeStamp,
            err,
          );
        },
      }),
    );
  }

  private logApiRequest(
    request: Request,
    response: Response,
    responseData: unknown,
    startTimeStamp: number,
    error?: unknown,
  ) {
    const endTimeStamp = Date.now() / 1000;
    const executionTimeSec = endTimeStamp - startTimeStamp;

    // Extract correct status code (NestJS Exception Filters handle it later, so we determine it now)
    let statusCode = response.statusCode;
    if (error) {
      statusCode =
        error instanceof HttpException
          ? error.getStatus()
          : typeof (error as Record<string, unknown>).status === 'number'
            ? ((error as Record<string, unknown>).status as number)
            : typeof (error as Record<string, unknown>).statusCode === 'number'
              ? ((error as Record<string, unknown>).statusCode as number)
              : 500;
    }

    // Calculate payload size in KB
    const body = request.body as unknown;
    const requestContent = JSON.stringify(body || {});
    // Buffer.byteLength is more accurate than string length for multi-byte characters
    const requestSizeKB = Number(
      (Buffer.byteLength(requestContent, 'utf8') / 1024).toFixed(2),
    );

    const responseContent = JSON.stringify(responseData || {});
    const responseSizeKB = Number(
      (Buffer.byteLength(responseContent, 'utf8') / 1024).toFixed(2),
    );

    const originalUrl = request.originalUrl;
    const userId = (request as { user?: { id?: number } }).user?.id || 0;

    const logData = {
      START_TIME: startTimeStamp,
      END_TIME: endTimeStamp,
      EXECUTION_TIME: Number(executionTimeSec.toFixed(4)),
      REQUEST_KB: requestSizeKB,
      RESPONSE_KB: responseSizeKB,
      TOTAL_KB: Number((requestSizeKB + responseSizeKB).toFixed(2)),
      USER_ID: userId,
      URL: originalUrl,
      METHOD: request.method,
      REQUEST_BODY: this.sanitizeBody(body),
      RESPONSE: this.sanitizeBody(responseData),
      IP: request.ip,
      STATUS: statusCode,
    };

    // Write to our dynamic logger specifying the 'api_logs' context
    this.logger.log(logData, 'api_logs');
  }

  /**
   * Helps prevent logging massive files or sensitive data like passwords.
   */
  private sanitizeBody(body: unknown): unknown {
    if (!body) return body;

    let clonedBody: unknown;
    try {
      clonedBody = JSON.parse(JSON.stringify(body));
    } catch {
      return '[Unserializable Content]';
    }

    const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret'];

    const redact = (obj: unknown) => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        obj.forEach(redact);
      } else {
        const record = obj as Record<string, unknown>;
        for (const key in record) {
          if (Object.prototype.hasOwnProperty.call(record, key)) {
            if (sensitiveKeys.includes(key.toLowerCase())) {
              record[key] = '[REDACTED]';
            } else if (typeof record[key] === 'object') {
              redact(record[key]);
            }
          }
        }
      }
    };

    redact(clonedBody);
    return clonedBody;
  }
}

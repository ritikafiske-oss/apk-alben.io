import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DynamicLoggerService } from '../logger/dynamic-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: DynamicLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // If a service/controller threw a pre-formed structured error object
    // (e.g. throw new BadRequestException({ success, code, message, data }))
    // pass it through directly so the custom code and data are preserved.
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'code' in res) {
        return response.status(status).json(res);
      }
    }

    // Log the exception to the exceptions file only for server errors (500+)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const userRequest = request as Request & { user?: { id?: number } };
      const userId = userRequest.user?.id || 0;
      const message =
        exception instanceof Error ? exception.message : 'Unknown error';

      const errorLog = {
        message,
        STATUS: status,
        URL: request.originalUrl,
        METHOD: request.method,
        IP: request.ip,
        USER_ID: userId,
        REQUEST_BODY: this.sanitizeBody(request.body as unknown),
      };

      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(errorLog, stack, 'exceptions');
    }

    // Generic fallback for any unhandled or system-level exceptions
    response.status(status).json({
      success: false,
      code:
        exception instanceof HttpException
          ? 'HTTP_ERROR_' + status
          : 'INTERNAL_SERVER_ERROR',
      message:
        exception instanceof HttpException
          ? typeof exception.getResponse() === 'object' &&
            exception.getResponse() !== null &&
            'message' in (exception.getResponse() as Record<string, unknown>)
            ? (exception.getResponse() as Record<string, { message: string }>)
                .message
            : exception.message
          : 'Something went wrong.',
      data: {},
    });
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

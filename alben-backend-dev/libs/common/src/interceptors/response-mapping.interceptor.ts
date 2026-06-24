import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response Mapping Interceptor
 *
 * Automatically detects responses with `success: false` and converts them
 * into Proper NestJS HttpExceptions with appropriate status codes.
 * This ensures that the client receives a non-200/201 status code while
 * maintaining the standardized JSON response structure.
 */
@Injectable()
export class ResponseMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If the response is structured as an ApiResponse and success is false
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as Record<string, unknown>).success === false
        ) {
          const responseData = data as Record<string, unknown>;
          const code = (responseData.code as string) || '';
          let status = HttpStatus.BAD_REQUEST;

          // Map error codes to appropriate HTTP status codes
          if (code.endsWith('_NOT_FOUND')) {
            status = HttpStatus.NOT_FOUND;
          } else if (code.endsWith('_UNAUTHORIZED')) {
            status = HttpStatus.UNAUTHORIZED;
          } else if (code.endsWith('_FORBIDDEN')) {
            status = HttpStatus.FORBIDDEN;
          } else if (
            code.endsWith('_ALREADY_EXISTS') ||
            code.endsWith('_CONFLICT')
          ) {
            status = HttpStatus.CONFLICT;
          }

          // Throwing an HttpException will be caught by the global AllExceptionsFilter.
          // We pass the entire data object to preserve the 'success', 'code', 'message', and 'data' fields.
          throw new HttpException(
            responseData as string | Record<string, unknown>,
            status,
          );
        }
        return data;
      }),
    );
  }
}

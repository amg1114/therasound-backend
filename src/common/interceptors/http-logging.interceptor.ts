import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor that logs all HTTP requests and their responses
 * Logs: method, URL, status code, and execution time
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          // Log successful response
          this.logger.log(
            `← ${method} ${url} - ${statusCode} - ${responseTime}ms`,
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          // Log error response
          this.logger.error(
            `← ${method} ${url} - ${statusCode} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}

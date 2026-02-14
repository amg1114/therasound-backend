import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

/**
 * Global exception filter that logs all HTTP exceptions
 * and formats the error response consistently
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const errorMessage = this.extractErrorMessage(exceptionResponse);

    const errorResponse = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'dev' &&
        exception instanceof Error && {
          stack: exception.stack,
        }),
    };

    // Log the exception with appropriate level
    const logMessage = `${request.method} ${request.url} - ${httpStatus} - ${this.formatMessage(errorMessage)}`;

    if (httpStatus >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (httpStatus >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    response.status(httpStatus).json(errorResponse);
  }

  private extractErrorMessage(
    exceptionResponse: string | object,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (this.isHttpExceptionResponse(exceptionResponse)) {
      return exceptionResponse.message || 'Unknown error';
    }

    return 'Unknown error';
  }

  private isHttpExceptionResponse(obj: object): obj is HttpExceptionResponse {
    return 'message' in obj;
  }

  private formatMessage(message: string | string[]): string {
    return Array.isArray(message) ? message.join(', ') : message;
  }
}

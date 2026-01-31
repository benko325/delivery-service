import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { MetricsService } from "../../infrastructure/metrics";

@Catch()
export class MetricsExceptionFilter implements ExceptionFilter {
  constructor(private readonly metricsService: MetricsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorType = "UnknownError";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message ||
            exception.message;
      errorType = exception.constructor.name;

      // Record HTTP error metrics
      this.metricsService.incrementErrors(errorType, status);
    } else if (exception instanceof Error) {
      errorType = exception.constructor.name;
      message = exception.message;

      // Record unhandled exception metrics
      this.metricsService.incrementUnhandledExceptions(errorType);
      this.metricsService.incrementErrors(errorType, status);
    } else {
      // Record unknown error
      this.metricsService.incrementUnhandledExceptions("UnknownError");
      this.metricsService.incrementErrors("UnknownError", status);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
    });
  }
}

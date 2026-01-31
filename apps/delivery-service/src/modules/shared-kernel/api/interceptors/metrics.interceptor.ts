import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Histogram } from "prom-client";
import { Request, Response } from "express";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_request_duration_seconds")
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const route = request.route?.path || request.path || "unknown";
        const method = request.method;
        const statusCode = response.statusCode.toString();

        this.httpRequestDuration.observe(
          {
            method,
            route,
            status_code: statusCode,
          },
          duration,
        );
      }),
    );
  }
}

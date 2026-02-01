import { Module, Global } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { metricsProviders } from "./metrics.providers";
import { MetricsService } from "./metrics.service";
import { MetricsInterceptor } from "../../api/interceptors/metrics.interceptor";

@Global()
@Module({
  providers: [
    ...metricsProviders,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [MetricsService],
})
export class MetricsModule {}

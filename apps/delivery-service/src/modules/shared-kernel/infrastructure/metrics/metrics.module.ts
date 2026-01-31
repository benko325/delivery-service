import { Module, Global } from "@nestjs/common";
import { metricsProviders } from "./metrics.providers";
import { MetricsService } from "./metrics.service";

@Global()
@Module({
  providers: [...metricsProviders, MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

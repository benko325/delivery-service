import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

// Infrastructure
import { AppConfigModule } from "./infrastructure/config/app-config.module";

// Shared Kernel
import { SharedKernelModule } from "./modules/shared-kernel/shared-kernel.module";
import { MetricsModule } from "./modules/shared-kernel/infrastructure/metrics";

// Feature Modules
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { DriversModule } from "./modules/drivers/drivers.module";
import { CartsModule } from "./modules/carts/carts.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    AppConfigModule,

    // Logging & Monitoring
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "info",
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
        genReqId: (req) =>
          req.headers["x-request-id"] ||
          `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        customProps: () => ({
          service: "delivery-service",
        }),
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "req.body.refreshToken",
          ],
          censor: "[REDACTED]",
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    PrometheusModule.register(),
    MetricsModule,

    // Shared Infrastructure
    SharedKernelModule,

    // Feature Modules (Bounded Contexts)
    HealthModule,
    AuthModule,
    CustomersModule,
    RestaurantsModule,
    DriversModule,
    CartsModule,
    OrdersModule,
    NotificationsModule,
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

// Infrastructure
import { AppConfigModule } from "./infrastructure/config/app-config.module";

// Shared Kernel
import { SharedKernelModule } from "./modules/shared-kernel/shared-kernel.module";

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

    // Static File Serving
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      exclude: ["/api*"],
    }),

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

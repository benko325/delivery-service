import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationConfigService } from "./notification-config.service";

@Module({
  imports: [ConfigModule],
  providers: [NotificationConfigService],
  exports: [NotificationConfigService],
})
export class NotificationConfigModule {}

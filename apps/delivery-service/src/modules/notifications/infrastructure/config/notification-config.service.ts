import { ValidatedConfigService } from "@/modules/shared-kernel";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import z from "zod";

const notificationConfigSchema = z.object({
  RABBITMQ_URI: z.string(),
});

@Injectable()
export class NotificationConfigService extends ValidatedConfigService {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  getSchema() {
    return notificationConfigSchema;
  }

  getRawConfig() {
    return {
      RABBITMQ_URI: this.configService.get("RABBITMQ_URI"),
    };
  }

  get rabbitmqUri(): string {
    return this.configService.get<string>("RABBITMQ_URI")!;
  }
}

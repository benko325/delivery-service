import { Injectable, OnModuleInit } from "@nestjs/common";
import { z } from "zod";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export abstract class ValidatedConfigService implements OnModuleInit {
  protected readonly logger: PinoLogger;

  constructor(logger: PinoLogger) {
    this.logger = logger;
    this.logger.setContext(this.constructor.name);
  }

  abstract getSchema(): z.ZodTypeAny;
  abstract getRawConfig(): Record<string, unknown>;

  onModuleInit() {
    const schema = this.getSchema();
    const rawConfig = this.getRawConfig();

    const result = schema.safeParse(rawConfig);

    if (!result.success) {
      const errors = result.error.errors
        .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      this.logger.error(`Configuration validation failed:\n${errors}`);
      throw new Error(
        `Configuration validation failed for ${this.constructor.name}`,
      );
    }

    this.logger.info("Configuration validated successfully");
  }
}

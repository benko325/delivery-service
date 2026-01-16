import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export abstract class ValidatedConfigService implements OnModuleInit {
    protected readonly logger = new Logger(this.constructor.name);

    abstract getSchema(): z.ZodTypeAny;
    abstract getRawConfig(): Record<string, unknown>;

    onModuleInit() {
        const schema = this.getSchema();
        const rawConfig = this.getRawConfig();

        const result = schema.safeParse(rawConfig);

        if (!result.success) {
            const errors = result.error.errors
                .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
                .join('\n');

            this.logger.error(`Configuration validation failed:\n${errors}`);
            throw new Error(`Configuration validation failed for ${this.constructor.name}`);
        }

        this.logger.log('Configuration validated successfully');
    }
}

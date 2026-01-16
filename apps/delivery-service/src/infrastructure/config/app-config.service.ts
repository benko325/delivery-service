import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ValidatedConfigService } from '../../modules/shared-kernel/infrastructure/env-config/validated-config.service';

const appConfigSchema = z.object({
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('localhost'),
    JWT_SECRET: z.string().min(32),
});

@Injectable()
export class AppConfigService extends ValidatedConfigService {
    constructor(private configService: ConfigService) {
        super();
    }

    getSchema() {
        return appConfigSchema;
    }

    getRawConfig() {
        return {
            PORT: this.configService.get('PORT'),
            HOST: this.configService.get('HOST'),
            JWT_SECRET: this.configService.get('JWT_SECRET'),
        };
    }

    get port(): number {
        return this.configService.get<number>('PORT') || 3000;
    }

    get host(): string {
        return this.configService.get<string>('HOST') || 'localhost';
    }

    get jwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET')!;
    }
}

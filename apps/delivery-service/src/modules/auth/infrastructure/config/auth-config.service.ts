import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ValidatedConfigService } from '../../../shared-kernel/infrastructure/env-config/validated-config.service';

const authConfigSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    RABBITMQ_URI: z.string(),
});

@Injectable()
export class AuthConfigService extends ValidatedConfigService {
    constructor(private configService: ConfigService) {
        super();
    }

    getSchema() {
        return authConfigSchema;
    }

    getRawConfig() {
        return {
            POSTGRES_HOST: this.configService.get('POSTGRES_HOST'),
            POSTGRES_PORT: this.configService.get('POSTGRES_PORT'),
            POSTGRES_USER: this.configService.get('POSTGRES_USER'),
            POSTGRES_PASSWORD: this.configService.get('POSTGRES_PASSWORD'),
            POSTGRES_DB: this.configService.get('POSTGRES_DB'),
            JWT_SECRET: this.configService.get('JWT_SECRET'),
            JWT_EXPIRES_IN: this.configService.get('JWT_EXPIRES_IN'),
            JWT_REFRESH_EXPIRES_IN: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
            RABBITMQ_URI: this.configService.get('RABBITMQ_URI'),
        };
    }

    get postgresHost(): string {
        return this.configService.get<string>('POSTGRES_HOST')!;
    }

    get postgresPort(): number {
        return this.configService.get<number>('POSTGRES_PORT')!;
    }

    get postgresUser(): string {
        return this.configService.get<string>('POSTGRES_USER')!;
    }

    get postgresPassword(): string {
        return this.configService.get<string>('POSTGRES_PASSWORD')!;
    }

    get postgresDb(): string {
        return this.configService.get<string>('POSTGRES_DB')!;
    }

    get jwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET')!;
    }

    get jwtExpiresIn(): string {
        return this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
    }

    get jwtRefreshExpiresIn(): string {
        return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    }

    get rabbitmqUri(): string {
        return this.configService.get<string>('RABBITMQ_URI')!;
    }
}

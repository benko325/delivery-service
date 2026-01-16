import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ValidatedConfigService } from '../../../shared-kernel/infrastructure/env-config/validated-config.service';

const customerConfigSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    RABBITMQ_URI: z.string(),
});

@Injectable()
export class CustomerConfigService extends ValidatedConfigService {
    constructor(private configService: ConfigService) {
        super();
    }

    getSchema() {
        return customerConfigSchema;
    }

    getRawConfig() {
        return {
            POSTGRES_HOST: this.configService.get('POSTGRES_HOST'),
            POSTGRES_PORT: this.configService.get('POSTGRES_PORT'),
            POSTGRES_USER: this.configService.get('POSTGRES_USER'),
            POSTGRES_PASSWORD: this.configService.get('POSTGRES_PASSWORD'),
            POSTGRES_DB: this.configService.get('POSTGRES_DB'),
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

    get rabbitmqUri(): string {
        return this.configService.get<string>('RABBITMQ_URI')!;
    }
}

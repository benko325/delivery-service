import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfigService } from './auth-config.service';
import { DatabaseModule } from '../../../shared-kernel/infrastructure/database/database.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                host: configService.get<string>('POSTGRES_HOST', 'localhost'),
                port: configService.get<number>('POSTGRES_PORT', 5433),
                user: configService.get<string>('POSTGRES_USER', 'admin'),
                password: configService.get<string>('POSTGRES_PASSWORD', 'admin'),
                database: configService.get<string>('POSTGRES_DB', 'delivery_service'),
                schema: 'auth',
            }),
        }),
    ],
    providers: [AuthConfigService],
    exports: [AuthConfigService, DatabaseModule],
})
export class AuthConfigModule {}

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from './infrastructure/env-config/env.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [EnvService],
    exports: [EnvService],
})
export class SharedKernelModule {}

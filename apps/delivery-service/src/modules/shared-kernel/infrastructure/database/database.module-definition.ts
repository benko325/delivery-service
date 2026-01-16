import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DatabaseOptions } from './database-options';

export const {
    ConfigurableModuleClass: ConfigurableDatabaseModule,
    MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<DatabaseOptions>()
    .setClassMethodName('forRoot')
    .build();

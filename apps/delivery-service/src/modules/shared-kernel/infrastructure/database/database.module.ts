import { Global, Module } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { CamelCasePlugin } from 'kysely';
import { ConfigurableDatabaseModule, MODULE_OPTIONS_TOKEN } from './database.module-definition';
import { DatabaseOptions } from './database-options';

@Global()
@Module({
    exports: ['DATABASE_CONNECTION'],
    providers: [
        {
            provide: 'DATABASE_CONNECTION',
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (options: DatabaseOptions) => {
                const dialect = new PostgresDialect({
                    pool: new Pool({
                        host: options.host,
                        port: options.port,
                        user: options.user,
                        password: options.password,
                        database: options.database,
                    }),
                });

                return new Kysely<unknown>({
                    dialect,
                    plugins: [new CamelCasePlugin()],
                });
            },
        },
    ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}

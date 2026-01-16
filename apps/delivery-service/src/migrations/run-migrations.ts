import { config } from 'dotenv';
config();

import { Kysely, PostgresDialect, Migrator, FileMigrationProvider } from 'kysely';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

const moduleMigrations = [
    { name: 'auth', path: '../modules/auth/infrastructure/database/migrations' },
    { name: 'customers', path: '../modules/customers/infrastructure/database/migrations' },
    { name: 'restaurants', path: '../modules/restaurants/infrastructure/database/migrations' },
    { name: 'drivers', path: '../modules/drivers/infrastructure/database/migrations' },
    { name: 'carts', path: '../modules/carts/infrastructure/database/migrations' },
    { name: 'orders', path: '../modules/orders/infrastructure/database/migrations' },
];

async function runMigrations() {
    const db = new Kysely<unknown>({
        dialect: new PostgresDialect({
            pool: new Pool({
                host: process.env.POSTGRES_HOST || 'localhost',
                port: parseInt(process.env.POSTGRES_PORT || '5432'),
                user: process.env.POSTGRES_USER || 'admin',
                password: process.env.POSTGRES_PASSWORD || 'admin',
                database: process.env.POSTGRES_DB || 'delivery_service',
            }),
        }),
    });

    console.log('Running migrations...\n');

    for (const module of moduleMigrations) {
        const migrationFolder = path.join(__dirname, module.path);

        if (!fs.existsSync(migrationFolder)) {
            console.log(`No migrations found for ${module.name}, skipping...`);
            continue;
        }

        const migrator = new Migrator({
            db,
            provider: new FileMigrationProvider({
                fs: fs.promises,
                path,
                migrationFolder,
            }),
            migrationTableName: `${module.name}_migrations`,
            migrationLockTableName: `${module.name}_migration_lock`,
        });

        console.log(`Running migrations for ${module.name}...`);

        const { error, results } = await migrator.migrateToLatest();

        results?.forEach((it) => {
            if (it.status === 'Success') {
                console.log(`  ✓ ${it.migrationName}`);
            } else if (it.status === 'Error') {
                console.log(`  ✗ ${it.migrationName}`);
            }
        });

        if (error) {
            console.error(`Failed to run migrations for ${module.name}:`, error);
            process.exit(1);
        }

        if (!results || results.length === 0) {
            console.log(`  No pending migrations`);
        }

        console.log('');
    }

    await db.destroy();
    console.log('All migrations completed successfully!');
}

runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});

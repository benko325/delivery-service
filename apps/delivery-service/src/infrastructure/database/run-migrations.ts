import {
  Kysely,
  PostgresDialect,
  Migrator,
  FileMigrationProvider,
} from "kysely";
import { Pool } from "pg";
import * as path from "path";
import * as fs from "fs";

const moduleMigrations = [
  {
    name: "auth",
    path: "../../modules/auth/infrastructure/database/migrations",
  },
  {
    name: "customers",
    path: "../../modules/customers/infrastructure/database/migrations",
  },
  {
    name: "restaurants",
    path: "../../modules/restaurants/infrastructure/database/migrations",
  },
  {
    name: "drivers",
    path: "../../modules/drivers/infrastructure/database/migrations",
  },
  {
    name: "carts",
    path: "../../modules/carts/infrastructure/database/migrations",
  },
  {
    name: "orders",
    path: "../../modules/orders/infrastructure/database/migrations",
  },
];

export async function runMigrations(): Promise<void> {
  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        user: process.env.POSTGRES_USER || "admin",
        password: process.env.POSTGRES_PASSWORD || "admin",
        database: process.env.POSTGRES_DB || "delivery_service",
      }),
    }),
  });

  console.log("Running database migrations...");

  for (const module of moduleMigrations) {
    const migrationFolder = path.join(__dirname, module.path);

    if (!fs.existsSync(migrationFolder)) {
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

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
      if (it.status === "Success") {
        console.log(`  [${module.name}] ✓ ${it.migrationName}`);
      } else if (it.status === "Error") {
        console.log(`  [${module.name}] ✗ ${it.migrationName}`);
      }
    });

    if (error) {
      await db.destroy();
      throw new Error(
        `Migration failed for ${module.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  await db.destroy();
  console.log("Migrations completed.");
}

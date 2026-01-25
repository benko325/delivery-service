import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create driver_status enum type
  await sql`
        DO $$ BEGIN
            CREATE TYPE drivers.driver_status AS ENUM ('available', 'busy', 'offline');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `.execute(db);

  // Create drivers table
  await db.schema
    .createTable("drivers.drivers")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("user_id", "uuid", (col) => col.notNull().unique())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("phone", "varchar(50)", (col) => col.notNull())
    .addColumn("vehicle_type", "varchar(100)", (col) => col.notNull())
    .addColumn("license_plate", "varchar(20)", (col) => col.notNull())
    .addColumn("status", sql`drivers.driver_status`, (col) =>
      col.notNull().defaultTo("offline"),
    )
    .addColumn("current_location", "jsonb")
    .addColumn("rating", "decimal(3, 2)", (col) => col.notNull().defaultTo(5.0))
    .addColumn("total_deliveries", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex("idx_drivers_user_id")
    .on("drivers.drivers")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("idx_drivers_status")
    .on("drivers.drivers")
    .column("status")
    .execute();

  await db.schema
    .createIndex("idx_drivers_rating")
    .on("drivers.drivers")
    .column("rating")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("drivers.drivers").execute();
  await sql`DROP TYPE IF EXISTS drivers.driver_status`.execute(db);
}

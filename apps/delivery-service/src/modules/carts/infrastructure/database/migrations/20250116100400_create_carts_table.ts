import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("carts.carts")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("customer_id", "uuid", (col) => col.notNull().unique())
    .addColumn("restaurant_id", "uuid")
    .addColumn("items", "jsonb", (col) =>
      col.notNull().defaultTo(sql`'[]'::jsonb`),
    )
    .addColumn("total_amount", "decimal(10, 2)", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("currency", "varchar(3)", (col) =>
      col.notNull().defaultTo("EUR"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_carts_customer_id")
    .on("carts.carts")
    .column("customer_id")
    .execute();

  await db.schema
    .createIndex("idx_carts_restaurant_id")
    .on("carts.carts")
    .column("restaurant_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("carts.carts").execute();
}

import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create restaurants table
  await db.schema
    .createTable("restaurants.restaurants")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("owner_id", "uuid", (col) => col.notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("address", "jsonb", (col) => col.notNull())
    .addColumn("phone", "varchar(50)", (col) => col.notNull())
    .addColumn("email", "varchar(255)", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("opening_hours", "jsonb", (col) =>
      col.notNull().defaultTo(sql`'{}'::jsonb`),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create menu_item_category enum type
  await sql`
        DO $$ BEGIN
            CREATE TYPE restaurants.menu_item_category AS ENUM ('appetizer', 'main_course', 'dessert', 'beverage', 'side');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `.execute(db);

  // Create menu_items table
  await db.schema
    .createTable("restaurants.menu_items")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("restaurant_id", "uuid", (col) =>
      col
        .notNull()
        .references("restaurants.restaurants.id")
        .onDelete("cascade"),
    )
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("price", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("currency", "varchar(3)", (col) =>
      col.notNull().defaultTo("EUR"),
    )
    .addColumn("category", sql`restaurants.menu_item_category`, (col) =>
      col.notNull(),
    )
    .addColumn("image_url", "varchar(500)")
    .addColumn("is_available", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .addColumn("preparation_time", "integer", (col) =>
      col.notNull().defaultTo(15),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex("idx_restaurants_owner_id")
    .on("restaurants.restaurants")
    .column("owner_id")
    .execute();

  await db.schema
    .createIndex("idx_restaurants_is_active")
    .on("restaurants.restaurants")
    .column("is_active")
    .execute();

  await db.schema
    .createIndex("idx_menu_items_restaurant_id")
    .on("restaurants.menu_items")
    .column("restaurant_id")
    .execute();

  await db.schema
    .createIndex("idx_menu_items_category")
    .on("restaurants.menu_items")
    .column("category")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("restaurants.menu_items").execute();
  await db.schema.dropTable("restaurants.restaurants").execute();
  await sql`DROP TYPE IF EXISTS restaurants.menu_item_category`.execute(db);
}

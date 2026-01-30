import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. Add new columns
  await db.schema
    .alterTable("customers.customers")
    .addColumn("addresses", "jsonb", (col) => col.defaultTo("[]"))
    .execute();

  await db.schema
    .alterTable("customers.customers")
    .addColumn("favorite_restaurant_ids", "jsonb", (col) => col.defaultTo("[]"))
    .execute();

  // 2. Migrate existing data (wrap single address into array and add ID)
  // SQL: UPDATE customers.customers SET addresses = jsonb_build_array(address || jsonb_build_object('id', gen_random_uuid())) WHERE address IS NOT NULL
  await db.executeQuery(
    sql`UPDATE customers.customers 
            SET addresses = jsonb_build_array(address || jsonb_build_object('id', gen_random_uuid())) 
            WHERE address IS NOT NULL`.compile(db),
  );

  // 3. Drop old column
  await db.schema
    .alterTable("customers.customers")
    .dropColumn("address")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Revert logic (simplistic: take first address)
  await db.schema
    .alterTable("customers.customers")
    .addColumn("address", "jsonb")
    .execute();

  await db.executeQuery(
    sql`UPDATE customers.customers 
            SET address = (addresses->0) - 'id' 
            WHERE jsonb_array_length(addresses) > 0`.compile(db),
  );

  await db.schema
    .alterTable("customers.customers")
    .dropColumn("addresses")
    .execute();

  await db.schema
    .alterTable("customers.customers")
    .dropColumn("favorite_restaurant_ids")
    .execute();
}

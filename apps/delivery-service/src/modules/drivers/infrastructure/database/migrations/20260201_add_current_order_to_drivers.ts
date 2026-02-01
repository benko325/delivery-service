import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("drivers.drivers")
    .addColumn("current_order_id", "varchar(255)")
    .execute();

  await db.schema
    .createIndex("idx_drivers_current_order")
    .on("drivers.drivers")
    .column("current_order_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .dropIndex("idx_drivers_current_order")
    .on("drivers.drivers")
    .execute();

  await db.schema
    .alterTable("drivers.drivers")
    .dropColumn("current_order_id")
    .execute();
}

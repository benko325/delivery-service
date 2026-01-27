import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("drivers.drivers")
    .dropColumn("name")
    .dropColumn("email")
    .dropColumn("phone")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("drivers.drivers")
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("phone", "varchar(50)")
    .execute();
}

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('customers.customers')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('phone', 'varchar(50)', (col) => col.notNull())
        .addColumn('address', 'jsonb')
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createIndex('idx_customers_email')
        .on('customers.customers')
        .column('email')
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('customers.customers').execute();
}

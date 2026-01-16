import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    // Create order_status enum type
    await sql`
        DO $$ BEGIN
            CREATE TYPE orders.order_status AS ENUM (
                'pending',
                'confirmed',
                'preparing',
                'ready_for_pickup',
                'driver_assigned',
                'picked_up',
                'in_transit',
                'delivered',
                'cancelled'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `.execute(db);

    // Create orders table
    await db.schema
        .createTable('orders.orders')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('customer_id', 'uuid', (col) => col.notNull())
        .addColumn('restaurant_id', 'uuid', (col) => col.notNull())
        .addColumn('driver_id', 'uuid')
        .addColumn('items', 'jsonb', (col) => col.notNull())
        .addColumn('delivery_address', 'jsonb', (col) => col.notNull())
        .addColumn('status', sql`orders.order_status`, (col) =>
            col.notNull().defaultTo('pending'),
        )
        .addColumn('total_amount', 'decimal(10, 2)', (col) => col.notNull())
        .addColumn('delivery_fee', 'decimal(10, 2)', (col) => col.notNull().defaultTo(0))
        .addColumn('currency', 'varchar(3)', (col) => col.notNull().defaultTo('USD'))
        .addColumn('estimated_delivery_time', 'timestamptz')
        .addColumn('actual_delivery_time', 'timestamptz')
        .addColumn('cancelled_at', 'timestamptz')
        .addColumn('cancellation_reason', 'text')
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .execute();

    // Create indexes
    await db.schema
        .createIndex('idx_orders_customer_id')
        .on('orders.orders')
        .column('customer_id')
        .execute();

    await db.schema
        .createIndex('idx_orders_restaurant_id')
        .on('orders.orders')
        .column('restaurant_id')
        .execute();

    await db.schema
        .createIndex('idx_orders_driver_id')
        .on('orders.orders')
        .column('driver_id')
        .execute();

    await db.schema
        .createIndex('idx_orders_status')
        .on('orders.orders')
        .column('status')
        .execute();

    await db.schema
        .createIndex('idx_orders_created_at')
        .on('orders.orders')
        .column('created_at')
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('orders.orders').execute();
    await sql`DROP TYPE IF EXISTS orders.order_status`.execute(db);
}

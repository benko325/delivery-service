import { Kysely, sql } from "kysely";

/**
 * Migration to update the order_status enum:
 * - Adds 'payment_succeeded' status (after 'pending')
 * - Removes 'driver_assigned' and 'picked_up' statuses
 *
 * This simplifies the order flow by adding a payment confirmation step
 * and removing intermediate driver-specific states.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  // Check if any orders use the statuses we're about to remove
  const result = await sql<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM orders.orders 
        WHERE status IN ('driver_assigned', 'picked_up')
    `.execute(db);

  const count = Number(result.rows[0]?.count ?? 0);

  if (count > 0) {
    throw new Error(
      `Cannot run migration: ${count} order(s) have 'driver_assigned' or 'picked_up' status. ` +
        "Please update these orders to a different status before running this migration.",
    );
  }

  // Create new enum with 'payment_succeeded' added and 'driver_assigned', 'picked_up' removed
  await sql`
        CREATE TYPE orders.order_status_new AS ENUM (
            'pending',
            'payment_succeeded',
            'confirmed',
            'preparing',
            'ready_for_pickup',
            'in_transit',
            'delivered',
            'cancelled'
        );
    `.execute(db);

  // Drop the default value constraint temporarily
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status DROP DEFAULT;
    `.execute(db);

  // Update the orders table to use the new enum
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status TYPE orders.order_status_new 
        USING status::text::orders.order_status_new;
    `.execute(db);

  // Re-add the default value
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status SET DEFAULT 'pending'::orders.order_status_new;
    `.execute(db);

  // Drop the old enum
  await sql`DROP TYPE orders.order_status;`.execute(db);

  // Rename the new enum to the original name
  await sql`ALTER TYPE orders.order_status_new RENAME TO order_status;`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Check if any orders use 'payment_succeeded' status
  const result = await sql<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM orders.orders 
        WHERE status = 'payment_succeeded'
    `.execute(db);

  const count = Number(result.rows[0]?.count ?? 0);

  if (count > 0) {
    throw new Error(
      `Cannot rollback migration: ${count} order(s) have 'payment_succeeded' status. ` +
        "Please update these orders to a different status before rolling back.",
    );
  }

  // Recreate the original enum (with 'driver_assigned' and 'picked_up', without 'payment_succeeded')
  await sql`
        CREATE TYPE orders.order_status_new AS ENUM (
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
    `.execute(db);

  // Drop the default value constraint temporarily
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status DROP DEFAULT;
    `.execute(db);

  // Update the orders table to use the original enum
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status TYPE orders.order_status_new 
        USING status::text::orders.order_status_new;
    `.execute(db);

  // Re-add the default value
  await sql`
        ALTER TABLE orders.orders 
        ALTER COLUMN status SET DEFAULT 'pending'::orders.order_status_new;
    `.execute(db);

  // Drop the old enum
  await sql`DROP TYPE orders.order_status;`.execute(db);

  // Rename the new enum to the original name
  await sql`ALTER TYPE orders.order_status_new RENAME TO order_status;`.execute(
    db,
  );
}

import { Kysely, sql } from "kysely";

// Test customers matching the seeded auth users
const TEST_CUSTOMERS = [
  {
    email: "customer@delivery.local",
    name: "Test Customer",
    phone: "123456789",
  },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  for (const customer of TEST_CUSTOMERS) {
    // Get the user ID from auth.users to use as customer ID
    const authUser = await sql`
      SELECT id FROM auth.users WHERE email = ${customer.email}
    `.execute(db);

    if (authUser.rows.length === 0) {
      console.log(
        `Auth user ${customer.email} not found, skipping customer seed`,
      );
      continue;
    }

    const userId = (authUser.rows[0] as { id: string }).id;

    // Check if customer already exists
    const existingCustomer = await sql`
      SELECT id FROM customers.customers WHERE id = ${userId}
    `.execute(db);

    if (existingCustomer.rows.length === 0) {
      await sql`
        INSERT INTO customers.customers (id, email, name, phone, addresses, favorite_restaurant_ids, created_at, updated_at)
        VALUES (${userId}, ${customer.email}, ${customer.name}, ${customer.phone}, '[]'::jsonb, '[]'::jsonb, now(), now())
      `.execute(db);
    }
  }

  console.log(`
    ============================================
    Test customers seeded:
${TEST_CUSTOMERS.map((c) => `      ${c.email} - ${c.name}`).join("\n")}
    ============================================
  `);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const customer of TEST_CUSTOMERS) {
    await sql`
      DELETE FROM customers.customers WHERE email = ${customer.email}
    `.execute(db);
  }
}

import { Kysely, sql } from "kysely";

// Test driver matching the seeded auth user
const TEST_DRIVERS = [
  {
    email: "driver@delivery.local",
    vehicleType: "Car",
    licensePlate: "TEST-123",
  },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  for (const driver of TEST_DRIVERS) {
    // Get the user ID from auth.users to use as driver user_id
    const authUser = await sql`
      SELECT id FROM auth.users WHERE email = ${driver.email}
    `.execute(db);

    if (authUser.rows.length === 0) {
      console.log(`Auth user ${driver.email} not found, skipping driver seed`);
      continue;
    }

    const userId = (authUser.rows[0] as { id: string }).id;

    // Check if driver already exists
    const existingDriver = await sql`
      SELECT id FROM drivers.drivers WHERE user_id = ${userId}
    `.execute(db);

    if (existingDriver.rows.length === 0) {
      await sql`
        INSERT INTO drivers.drivers (user_id, vehicle_type, license_plate, status, is_active, created_at, updated_at)
        VALUES (${userId}, ${driver.vehicleType}, ${driver.licensePlate}, 'offline', true, now(), now())
      `.execute(db);
    }
  }

  console.log(`
    ============================================
    Test drivers seeded:
${TEST_DRIVERS.map((d) => `      ${d.email} - ${d.vehicleType} (${d.licensePlate})`).join("\n")}
    ============================================
  `);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const driver of TEST_DRIVERS) {
    const authUser = await sql`
      SELECT id FROM auth.users WHERE email = ${driver.email}
    `.execute(db);

    if (authUser.rows.length > 0) {
      const userId = (authUser.rows[0] as { id: string }).id;
      await sql`
        DELETE FROM drivers.drivers WHERE user_id = ${userId}
      `.execute(db);
    }
  }
}

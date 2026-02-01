import { Kysely, sql } from "kysely";
import * as crypto from "crypto";

// Additional test users for K6 testing
const TEST_USERS = [
  {
    email: "customer@delivery.local",
    password: "Customer123!",
    roles: '["customer"]',
  },
  {
    email: "driver@delivery.local",
    password: "Driver123!",
    roles: '["driver"]',
  },
  {
    email: "owner@delivery.local",
    password: "Owner123!",
    roles: '["restaurant_owner"]',
  },
];

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function up(db: Kysely<unknown>): Promise<void> {
  for (const user of TEST_USERS) {
    const hashedPassword = await hashPassword(user.password);

    // Check if user already exists
    const existingUser = await sql`
        SELECT id FROM auth.users WHERE email = ${user.email}
    `.execute(db);

    if (existingUser.rows.length === 0) {
      await sql`
        INSERT INTO auth.users (id, email, password, roles, refresh_token, created_at, updated_at)
        VALUES (gen_random_uuid(), ${user.email}, ${hashedPassword}, ${user.roles}::jsonb, NULL, now(), now())
      `.execute(db);
    }
  }

  console.log(`
    ============================================
    Test users seeded:
${TEST_USERS.map((u) => `      ${u.roles.padEnd(22)} - ${u.email} / ${u.password}`).join("\n")}

    IMPORTANT: Change these credentials in production!
    ============================================
  `);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const user of TEST_USERS) {
    await sql`
        DELETE FROM auth.users WHERE email = ${user.email}
    `.execute(db);
  }
}

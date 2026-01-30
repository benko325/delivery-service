import { Kysely, sql } from "kysely";
import * as crypto from "crypto";

// Default admin credentials - CHANGE IN PRODUCTION
const ADMIN_EMAIL = "admin@delivery.local";
const ADMIN_PASSWORD = "Admin123!";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function up(db: Kysely<unknown>): Promise<void> {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  // Check if admin already exists
  const existingAdmin = await sql`
        SELECT id FROM auth.users WHERE email = ${ADMIN_EMAIL}
    `.execute(db);

  if (existingAdmin.rows.length === 0) {
    await sql`
            INSERT INTO auth.users (id, email, password, roles, refresh_token, created_at, updated_at)
            VALUES (gen_random_uuid(), ${ADMIN_EMAIL}, ${hashedPassword}, '["admin"]'::jsonb, NULL, now(), now())
        `.execute(db);
  }

  console.log(`
    ============================================
    Admin user seeded:
      Email: ${ADMIN_EMAIL}
      Password: ${ADMIN_PASSWORD}

    IMPORTANT: Change these credentials in production!
    ============================================
    `);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
        DELETE FROM auth.users WHERE email = ${ADMIN_EMAIL}
    `.execute(db);
}

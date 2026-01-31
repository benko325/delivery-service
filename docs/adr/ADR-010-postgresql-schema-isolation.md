# ADR-010: PostgreSQL Schema-per-Module

## Status
**Accepted** - 2025-01-16

## Context

In a modular monolith, we want database isolation between modules to:
- Enforce module boundaries at the database level
- Prevent accidental cross-module queries
- Prepare for potential microservices extraction
- Provide clear ownership of data

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Single schema** | Simple, easy joins | No isolation, coupled modules |
| **Schema per module** | Isolation, clear ownership | No cross-schema FK, more setup |
| **Database per module** | Full isolation | Complex transactions, more infra |
| **Table prefixes** | Simple naming | No real isolation, just convention |

## Decision

We will use **PostgreSQL schemas** to isolate each module's data.

### Schema Structure
```sql
-- init-db.sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS customers;
CREATE SCHEMA IF NOT EXISTS restaurants;
CREATE SCHEMA IF NOT EXISTS drivers;
CREATE SCHEMA IF NOT EXISTS carts;
CREATE SCHEMA IF NOT EXISTS orders;
```

### Table Naming Convention
```
schema_name.table_name

Examples:
- auth.users
- customers.customers
- restaurants.restaurants
- restaurants.menu_items
- carts.carts
- orders.orders
- drivers.drivers
```

### Migration Implementation
```typescript
// auth/infrastructure/database/migrations/20250116100000_create_auth_users_table.ts
export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('auth.users')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('email', 'varchar(255)', col => col.notNull().unique())
        .addColumn('password', 'varchar(255)', col => col.notNull())
        .addColumn('roles', 'jsonb', col => col.notNull().defaultTo(sql`'["customer"]'::jsonb`))
        .execute();
}

// orders/infrastructure/database/migrations/20250116100500_create_orders_table.ts
export async function up(db: Kysely<unknown>): Promise<void> {
    // Create enum in orders schema
    await sql`CREATE TYPE orders.order_status AS ENUM (...)`.execute(db);

    await db.schema
        .createTable('orders.orders')
        .addColumn('id', 'uuid', col => col.primaryKey())
        .addColumn('customer_id', 'uuid', col => col.notNull())  // No FK to customers schema
        .addColumn('restaurant_id', 'uuid', col => col.notNull()) // No FK to restaurants schema
        .addColumn('status', sql`orders.order_status`, col => col.notNull())
        .execute();
}
```

### Repository Queries
```typescript
// Each repository only queries its own schema
export class OrderRepository {
    async findById(id: string): Promise<Order | null> {
        return this.db
            .selectFrom('orders.orders')  // Explicit schema
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
    }
}
```

### Cross-Module References

**No Foreign Keys** between schemas - modules store IDs as UUIDs without database-level constraints:

```typescript
// orders.orders table
{
    customer_id: 'uuid',    // References auth.users.id (no FK)
    restaurant_id: 'uuid',  // References restaurants.restaurants.id (no FK)
    driver_id: 'uuid',      // References drivers.drivers.id (no FK)
}
```

**Validation at Application Level:**
- Command handlers validate referenced entities exist
- Application enforces referential integrity, not database

## Consequences

### Positive
- **Clear boundaries** - Each module owns its schema
- **No accidental coupling** - Can't accidentally join across modules
- **Easier extraction** - Schema can become separate database
- **Namespace isolation** - Tables and enums scoped to module
- **Performance** - Can tune schemas independently

### Negative
- **No cross-schema FK** - Must validate references in application
- **No cross-schema joins** - Must query each schema separately
- **Eventual consistency** - Orphan data possible if events fail

### Mitigations
- Application-level validation before saving
- Idempotent event handlers for retry safety
- Periodic cleanup jobs for orphan data (if needed)

## Schema Layout

```
PostgreSQL Database: delivery_service
│
├── auth schema
│   └── users (id, email, password, roles, refresh_token, timestamps)
│
├── customers schema
│   └── customers (id, user_id, email, name, phone, address, timestamps)
│
├── restaurants schema
│   ├── restaurants (id, owner_id, name, description, address, is_active, timestamps)
│   └── menu_items (id, restaurant_id, name, price, category, is_available, timestamps)
│
├── drivers schema
│   └── drivers (id, user_id, name, email, vehicle_type, status, location, timestamps)
│
├── carts schema
│   └── carts (id, customer_id, restaurant_id, items, total_amount, timestamps)
│
└── orders schema
    └── orders (id, customer_id, restaurant_id, driver_id, items, status, timestamps)
```

## References
- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Schema-per-Service in Modular Monolith](https://www.kamilgrzybek.com/design/modular-monolith-database-isolation/)

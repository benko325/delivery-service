# ADR-004: Kysely for Database Access

## Status
**Accepted** - 2025-01-16

## Context

We need a database access layer for PostgreSQL that provides:
- Type safety for queries
- Migration support
- Good developer experience
- Performance without magic

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **TypeORM** | Full ORM, decorators, migrations | Magic behavior, performance issues, complex queries |
| **Prisma** | Type-safe, great DX, migrations | Schema-first requires build step, limited raw SQL |
| **Kysely** | Type-safe SQL builder, no magic, lightweight | No decorators, more verbose, newer ecosystem |
| **Raw pg** | Full control, fastest | No type safety, manual SQL, error-prone |

## Decision

We will use **Kysely** as our database access layer because:

1. **Type-safe SQL** - Queries are fully typed without magic
2. **No runtime overhead** - Compiles to raw SQL
3. **Full SQL control** - Write any query PostgreSQL supports
4. **Lightweight** - Small bundle size, minimal dependencies
5. **Migration support** - Built-in migration tooling

### Implementation

**Database Module Setup:**
```typescript
@Global()
@Module({
    providers: [{
        provide: 'DATABASE_CONNECTION',
        useFactory: (options: DatabaseOptions) => {
            const dialect = new PostgresDialect({
                pool: new Pool({ ...options }),
            });
            return new Kysely<unknown>({
                dialect,
                plugins: [new CamelCasePlugin()], // snake_case → camelCase
            });
        },
    }],
})
export class DatabaseModule {}
```

**Repository Implementation:**
```typescript
@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<OrderDatabase>,
    ) {}

    async findByCustomerId(customerId: string): Promise<Order[]> {
        return this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('customerId', '=', customerId)
            .orderBy('createdAt', 'desc')
            .execute();
    }
}
```

**Migrations:**
```typescript
export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('orders.orders')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('customer_id', 'uuid', col => col.notNull())
        .addColumn('status', sql`orders.order_status`, col => col.notNull())
        .addColumn('items', 'jsonb', col => col.notNull())
        .execute();
}
```

## Consequences

### Positive
- **Full type safety** - Compiler catches query errors
- **Predictable SQL** - What you write is what executes
- **JSONB support** - First-class support for PostgreSQL JSON columns
- **CamelCase plugin** - Automatic conversion between DB and TypeScript conventions
- **Connection pooling** - Uses pg Pool for performance

### Negative
- **More verbose** - No automatic relation loading
- **Manual joins** - Must write explicit join queries
- **Smaller community** - Less StackOverflow answers than TypeORM/Prisma

### Mitigations
- Create repository patterns for common queries
- Document query patterns in module READMEs
- Use TypeScript interfaces for database schemas

## References
- [Kysely Documentation](https://kysely.dev/)
- [Type-safe database access with Kysely](https://www.prisma.io/dataguide/database-tools/top-nodejs-orms-query-builders-and-database-libraries#kysely)

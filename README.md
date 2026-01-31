# Delivery Service - Modular Monolith

A food delivery service system built with NestJS using modern architecture patterns:

- **Modular Monolith** - Isolated modules that can evolve into microservices
- **Vertical Slice Architecture** - Each module contains all layers (API, Application, Core, Infrastructure)
- **Clean Architecture** - Dependency inversion with clear layer separation
- **CQRS** - Command Query Responsibility Segregation using @nestjs/cqrs
- **Event-Driven Architecture** - Domain events published via RabbitMQ
- **Aggregate Root Pattern** - Domain entities with business logic encapsulation

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | NestJS 11 | Modular backend framework with dependency injection |
| **Database** | PostgreSQL 17 | Primary data store with schema-per-module isolation |
| **ORM** | Kysely | Type-safe SQL query builder (no magic, full control) |
| **Message Queue** | RabbitMQ | Asynchronous event publishing between modules |
| **RabbitMQ Client** | @golevelup/nestjs-rabbitmq | NestJS integration for AMQP |
| **CQRS** | @nestjs/cqrs | Command/Query/Event bus implementation |
| **Authentication** | Passport.js + JWT | Stateless token-based auth |
| **Validation** | Zod + nestjs-zod | Runtime schema validation with TypeScript inference |
| **Password Hashing** | Node.js crypto (scrypt) | Secure password storage |
| **Logging** | Pino (nestjs-pino) | Structured JSON logging with correlation IDs |
| **Metrics** | Prometheus | Time-series metrics collection |
| **Dashboards** | Grafana | Metrics visualization and alerting |
| **Build Tool** | Turbo | Monorepo build orchestration |
| **Package Manager** | pnpm | Fast, disk-efficient package manager |
| **API Docs** | Swagger/OpenAPI | Auto-generated API documentation |

## Project Structure

```
solution-project/
├── apps/
│   └── delivery-service/           # Main NestJS application
│       ├── src/
│       │   ├── infrastructure/     # App-level infrastructure
│       │   ├── modules/
│       │   │   ├── shared-kernel/  # Cross-cutting concerns (metrics, logging)
│       │   │   ├── auth/           # Authentication module
│       │   │   ├── customers/      # Customer management
│       │   │   ├── restaurants/    # Restaurant & menu management
│       │   │   ├── drivers/        # Driver management
│       │   │   ├── carts/          # Shopping cart
│       │   │   ├── orders/         # Order management
│       │   │   └── health/         # Health check
│       │   ├── migrations/         # Database migrations runner
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prometheus.yml          # Prometheus scrape config
│       └── grafana/                # Grafana provisioning
│           └── provisioning/
│               ├── datasources/    # Prometheus datasource
│               └── dashboards/     # Pre-built dashboards
├── docker-compose.yml              # PostgreSQL + RabbitMQ + Prometheus + Grafana
├── init-db.sql                     # Schema initialization
└── README.md
```

## Module Structure (Vertical Slice)

Each module follows this structure:

```
module/
├── api/                            # Presentation layer
│   ├── controllers/                # REST endpoints
│   └── dto/                        # Zod validation schemas
├── application/                    # Application layer
│   ├── commands/                   # Command handlers (write operations)
│   ├── queries/                    # Query handlers (read operations)
│   └── events/                     # Event handlers (anti-corruption layer)
├── core/                           # Domain layer
│   ├── aggregates/                 # Aggregate roots with business logic
│   ├── entities/                   # Entity interfaces
│   ├── events/                     # Domain events
│   ├── repositories/               # Repository interfaces
│   └── types/                      # Domain types
└── infrastructure/                 # Infrastructure layer
    ├── config/                     # Module configuration
    ├── anti-corruption-layer/      # Event mappers from other modules
    └── database/
        ├── migrations/             # Kysely migrations
        └── repositories/           # Repository implementations
```

---

## Architecture Deep Dive

### Request Flow (CQRS Pattern)

The application follows the CQRS pattern where reads and writes are separated:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WRITE FLOW (Commands)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HTTP Request                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐               │
│   │ Controller  │───▶│  CommandBus  │───▶│ CommandHandler  │               │
│   │ (API Layer) │    │  (dispatch)  │    │ (Application)   │               │
│   └─────────────┘    └──────────────┘    └────────┬────────┘               │
│                                                   │                         │
│                                                   ▼                         │
│                                          ┌───────────────┐                  │
│                                          │   Aggregate   │                  │
│                                          │ (Domain Logic)│                  │
│                                          └───────┬───────┘                  │
│                                                  │                          │
│                      ┌───────────────────────────┼───────────────────────┐  │
│                      │                           │                       │  │
│                      ▼                           ▼                       │  │
│              ┌──────────────┐           ┌──────────────┐                 │  │
│              │  Repository  │           │ EventPublisher│                │  │
│              │ (save to DB) │           │  (commit())   │                │  │
│              └──────────────┘           └──────────────┘                 │  │
│                                                                          │  │
└──────────────────────────────────────────────────────────────────────────┘  │
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┐
│                               READ FLOW (Queries)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HTTP Request                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐               │
│   │ Controller  │───▶│  QueryBus   │───▶│  QueryHandler   │               │
│   │ (API Layer) │    │  (dispatch)  │    │ (Application)   │               │
│   └─────────────┘    └──────────────┘    └────────┬────────┘               │
│                                                   │                         │
│                                                   ▼                         │
│                                          ┌───────────────┐                  │
│                                          │  Repository   │                  │
│                                          │ (read from DB)│                  │
│                                          └───────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Example: Creating an Order

```typescript
// 1. Controller receives HTTP POST /api/orders
@Post()
async createOrder(@User() user, @Body() dto: CreateOrderDto) {
    return this.commandBus.execute(
        new CreateOrderCommand(user.userId, dto.restaurantId, dto.items, ...)
    );
}

// 2. CommandHandler processes the command
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler {
    async execute(command: CreateOrderCommand) {
        // Create aggregate with EventPublisher context
        const orderAggregate = this.publisher.mergeObjectContext(new OrderAggregate());

        // Business logic in aggregate
        orderAggregate.create(command.customerId, command.restaurantId, ...);

        // Persist to database
        await this.orderRepository.save(orderAggregate);

        // Publish domain events to RabbitMQ
        orderAggregate.commit();

        return { id: orderAggregate.id };
    }
}

// 3. Aggregate contains business logic and applies events
export class OrderAggregate extends AggregateRoot {
    create(customerId, restaurantId, items, ...) {
        // Validate business rules
        if (items.length === 0) throw new Error('Order must have items');

        // Set state
        this._id = uuid();
        this._status = 'pending';
        // ...

        // Apply domain event
        this.apply(new OrderCreatedEvent(this._id, customerId, ...));
    }
}
```

---

## Database with Kysely

Kysely is a type-safe SQL query builder that provides full control over queries without ORM magic.

### Database Module Setup

```typescript
// shared-kernel/infrastructure/database/database.module.ts
@Global()
@Module({
    providers: [{
        provide: 'DATABASE_CONNECTION',
        useFactory: (options: DatabaseOptions) => {
            const dialect = new PostgresDialect({
                pool: new Pool({
                    host: options.host,
                    port: options.port,
                    user: options.user,
                    password: options.password,
                    database: options.database,
                }),
            });
            return new Kysely<unknown>({
                dialect,
                plugins: [new CamelCasePlugin()],  // snake_case DB → camelCase TS
            });
        },
    }],
})
export class DatabaseModule {}
```

### Migrations

Each module has its own migrations in `infrastructure/database/migrations/`:

```typescript
// Example: 20250116100500_create_orders_table.ts
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
    // Create enum type
    await sql`
        CREATE TYPE orders.order_status AS ENUM (
            'pending', 'confirmed', 'preparing', 'ready_for_pickup',
            'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
        )
    `.execute(db);

    // Create table with schema prefix
    await db.schema
        .createTable("orders.orders")
        .addColumn("id", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("customer_id", "uuid", col => col.notNull())
        .addColumn("restaurant_id", "uuid", col => col.notNull())
        .addColumn("status", sql`orders.order_status`, col => col.notNull().defaultTo("pending"))
        .addColumn("items", "jsonb", col => col.notNull())
        .addColumn("total_amount", "decimal(10, 2)", col => col.notNull())
        .addColumn("currency", "varchar(3)", col => col.notNull().defaultTo("EUR"))
        .addColumn("created_at", "timestamptz", col => col.notNull().defaultTo(sql`now()`))
        .execute();

    // Create indexes
    await db.schema
        .createIndex("idx_orders_customer_id")
        .on("orders.orders")
        .column("customer_id")
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable("orders.orders").execute();
    await sql`DROP TYPE IF EXISTS orders.order_status`.execute(db);
}
```

### Type-Safe Repository

```typescript
// Repository implementation with Kysely
@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<OrderDatabase>,
    ) {}

    async findById(id: string): Promise<Order | null> {
        const order = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return order ? this.mapToOrder(order) : null;
    }

    async findByStatus(status: OrderStatus): Promise<Order[]> {
        const orders = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('status', '=', status)
            .orderBy('createdAt', 'asc')
            .execute();

        return orders.map(o => this.mapToOrder(o));
    }
}
```

### Running Migrations

```bash
cd apps/delivery-service
pnpm migrate        # Run all pending migrations
pnpm migrate:down   # Rollback last migration
```

---

## Event-Driven Architecture

### Event Publishing (RabbitMQ)

Events are published to RabbitMQ when `aggregate.commit()` is called:

```
┌────────────────┐        ┌─────────────────┐        ┌───────────────┐
│   Aggregate    │        │  EventPublisher │        │   RabbitMQ    │
│                │        │  (NestJS CQRS)  │        │               │
│  apply(event)  │───────▶│                 │───────▶│ Queue: Event  │
│  commit()      │        │  publish(event) │        │    Name       │
└────────────────┘        └─────────────────┘        └───────────────┘
```

**Publisher Implementation:**

```typescript
// shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher.ts
@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    async publish<T extends IEvent>(event: T): Promise<void> {
        const eventName = event.constructor.name;  // e.g., "CartOrderedEvent"
        const payload = JSON.stringify(event);

        // Publish to queue named after the event
        await this.amqpConnection.publish('', eventName, payload);
    }
}
```

### Event Subscribing

Modules subscribe to events they care about:

```
┌───────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   RabbitMQ    │        │   Subscriber     │        │  EventHandler   │
│               │        │                  │        │  (ACL Mapper)   │
│ Queue: Event  │───────▶│ bridgeEventsTo   │───────▶│                 │
│    Name       │        │   (EventBus)     │        │  handle(event)  │
└───────────────┘        └──────────────────┘        └─────────────────┘
```

**Subscriber Implementation:**

```typescript
// shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber.ts
@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject('EVENTS') private readonly events: Array<EventConstructor<IEvent>>,
    ) {}

    async connect(): Promise<void> {
        for (const Event of this.events) {
            await this.amqpConnection.createSubscriber<string>(
                async (message) => {
                    const parsedJson = JSON.parse(message);
                    const receivedEvent = new Event(parsedJson);
                    this.bridge.next(receivedEvent);  // Forward to EventBus
                },
                { queue: Event.name },
            );
        }
    }
}
```

### Module Registration for Events

```typescript
// orders/orders.module.ts
@Module({
    providers: [
        // Register events this module publishes
        { provide: 'EVENTS', useValue: [OrderCreatedEvent, OrderStatusChangedEvent] },

        // Register event handlers (ACL mappers)
        CartOrderedEventHandler,
    ],
})
export class OrdersModule {}
```

---

## Anti-Corruption Layer (ACL)

The ACL pattern protects module boundaries by mapping external events to internal commands:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CARTS MODULE                                │
│                                                                     │
│   Cart.checkout() ──▶ apply(CartOrderedEvent) ──▶ commit()         │
│                                                                     │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                                     ▼ RabbitMQ
                                     │
┌────────────────────────────────────┼────────────────────────────────┐
│                         ORDERS MODULE                               │
│                                     │                               │
│   ┌─────────────────────────────────▼──────────────────────────┐   │
│   │              Anti-Corruption Layer (ACL)                    │   │
│   │                                                             │   │
│   │   CartOrderedEventHandler                                   │   │
│   │   ├── Receives: CartOrderedEvent (Carts domain types)      │   │
│   │   ├── Maps: CartItem[] → OrderItem[]                       │   │
│   │   └── Executes: CreateOrderCommand (Orders domain types)   │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**ACL Mapper Example:**

```typescript
// orders/infrastructure/anti-corruption-layer/cart-ordered.mapper.ts
@EventsHandler(CartOrderedEvent)
export class CartOrderedEventHandler implements IEventHandler<CartOrderedEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    async handle(event: CartOrderedEvent): Promise<void> {
        // Map Carts domain types → Orders domain types
        const orderItems: OrderItem[] = event.items.map(cartItem => ({
            menuItemId: cartItem.menuItemId,
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
            currency: cartItem.currency,
        }));

        const deliveryAddress: DeliveryAddress = {
            street: event.deliveryAddress.street,
            city: event.deliveryAddress.city,
            postalCode: event.deliveryAddress.postalCode,
            country: event.deliveryAddress.country,
        };

        // Execute command with Orders domain types
        await this.commandBus.execute(
            new CreateOrderCommand(
                event.customerId,
                event.restaurantId,
                orderItems,
                deliveryAddress,
                event.totalAmount,
                event.deliveryFee,
                event.currency,
            )
        );
    }
}
```

---

## Validation with Zod

DTOs use Zod schemas for runtime validation with TypeScript type inference:

```typescript
// orders/api/dto/order.dto.ts
import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const deliveryAddressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    instructions: z.string().optional(),
});

const orderItemSchema = z.object({
    menuItemId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    currency: z.string().length(3).default("EUR"),
});

export const createOrderSchema = z.object({
    restaurantId: z.string().uuid("Invalid restaurant ID"),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    deliveryAddress: deliveryAddressSchema,
    deliveryFee: z.number().min(0).default(0),
    currency: z.string().length(3).default("EUR"),
});

// Auto-generates class with validation
export class CreateOrderDto extends createZodDto(createOrderSchema) {}
```

---

## Modules

### Auth Module
- User registration and login
- JWT token management (access + refresh tokens)
- Password hashing with scrypt (salt + hash)
- Publishes `UserRegisteredEvent` for other modules

### Customers Module
- Customer profile management
- Delivery address management
- Listens to `UserRegisteredEvent` via ACL

### Restaurants Module
- Restaurant CRUD operations
- Menu item management
- Categories: appetizer, main_course, dessert, beverage, side
- Default currency: EUR

### Drivers Module
- Driver registration and profile
- Availability status (available, busy, offline)
- Location tracking
- Rating system

### Carts Module
- Add/remove items to cart
- Quantity management
- Single restaurant per cart enforcement
- Automatic total calculation
- Checkout publishes `CartOrderedEvent`

### Orders Module
- Order creation from cart (via ACL)
- Order status workflow:
  - pending → confirmed → preparing → ready_for_pickup → driver_assigned → picked_up → in_transit → delivered
- Driver acceptance (drivers choose orders)
- Order cancellation

---

## Monitoring & Observability

The application includes comprehensive monitoring with Pino for structured logging and Prometheus/Grafana for metrics visualization.

### Logging (Pino)

- **Structured JSON logs** in production, pretty-printed in development
- **Correlation IDs** via `x-request-id` header for request tracing
- **Automatic redaction** of sensitive data (passwords, tokens, cookies)
- **Log levels** configurable via `LOG_LEVEL` environment variable

### Metrics (Prometheus)

Metrics are exposed at `/metrics` endpoint. Available metrics include:

| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_seconds` | Histogram | API latency by method, route, status |
| `orders_created_total` | Counter | Total orders created |
| `orders_completed_total` | Counter | Successful deliveries |
| `revenue_total` | Counter | Total revenue by currency |
| `login_attempts_total` | Counter | Authentication attempts |
| `errors_total` | Counter | Errors by type and status code |
| `active_drivers` | Gauge | Currently available drivers |

### Grafana Dashboards

Pre-configured dashboards available at http://localhost:3001 (default credentials: admin/admin):

- HTTP Request Rate and Latency (p50, p95, p99)
- Orders and Revenue Over Time
- Error Rate by Type
- Driver Availability
- Restaurant Performance

### Accessing Monitoring Tools

```bash
# Start all services including monitoring
docker-compose up -d

# Access points:
# - Prometheus: http://localhost:9095
# - Grafana: http://localhost:3001
# - Metrics endpoint: http://localhost:3000/metrics
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start infrastructure:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
cd apps/delivery-service
pnpm migrate
```

4. Start development server:
```bash
pnpm dev
```

### API Documentation

Swagger UI is available at: http://localhost:3000/api/docs

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers/me` - Get profile
- `PUT /api/customers/me` - Update profile
- `PATCH /api/customers/me/address` - Update delivery address

### Restaurants
- `GET /api/restaurants` - List active restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (owner/admin)
- `GET /api/restaurants/:id/menu` - Get menu items

### Drivers
- `GET /api/drivers/me` - Get driver profile
- `PUT /api/drivers/me` - Update profile
- `PATCH /api/drivers/me/location` - Update location
- `PATCH /api/drivers/me/availability` - Set availability

### Carts
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item
- `PATCH /api/cart/items` - Update quantity
- `DELETE /api/cart/items` - Remove item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/checkout` - Checkout cart (creates order)

### Orders
- `POST /api/orders` - Create order directly
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/available` - Get available orders (driver)
- `POST /api/orders/:id/accept` - Accept order (driver)
- `PATCH /api/orders/:id/status` - Update status
- `POST /api/orders/:id/cancel` - Cancel order

---

## User Roles

- `customer` - Can browse restaurants, manage cart, place orders
- `driver` - Can see available orders, accept and deliver
- `restaurant_owner` - Can manage restaurant and menu
- `admin` - Full access to all operations

---

## Default Test Credentials

After running migrations and seed data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.local | admin123 |

---

## Currency

The default currency across the system is **EUR** (Euro).

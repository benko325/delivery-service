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
| **Backend Framework** | NestJS 11 | Modular backend framework with dependency injection |
| **Frontend Framework** | Nuxt 4 | Vue 3 SSR framework with file-based routing |
| **UI Components** | Vue 3 + Bootstrap 5 | Reactive components with responsive styling |
| **State Management** | Pinia | Vue store for auth and cart state |
| **API Client** | openapi-fetch | Type-safe API client from OpenAPI schema |
| **Data Fetching** | TanStack Query | Server state management with caching |
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
| **Reverse Proxy** | Nginx | Unified domain routing and load balancing |
| **Containerization** | Docker + Compose | Multi-container orchestration |
| **Build Tool** | Turbo | Monorepo build orchestration |
| **Package Manager** | pnpm | Fast, disk-efficient package manager |
| **API Docs** | Swagger/OpenAPI | Auto-generated API documentation |

## Project Structure

```
delivery-service/
├── apps/
│   ├── delivery-service/           # Main NestJS application
│   │   ├── src/
│   │   │   ├── infrastructure/     # App-level infrastructure
│   │   │   ├── modules/
│   │   │   │   ├── shared-kernel/  # Cross-cutting concerns (metrics, logging)
│   │   │   │   ├── auth/           # Authentication module
│   │   │   │   ├── customers/      # Customer management
│   │   │   │   ├── restaurants/    # Restaurant & menu management
│   │   │   │   ├── drivers/        # Driver management
│   │   │   │   ├── carts/          # Shopping cart
│   │   │   │   ├── orders/         # Order management
│   │   │   │   └── health/         # Health check
│   │   │   ├── migrations/         # Database migrations runner
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prometheus.yml          # Prometheus scrape config
│   │   └── grafana/                # Grafana provisioning
│   │       └── provisioning/
│   │           ├── datasources/    # Prometheus datasource
│   │           └── dashboards/     # Pre-built dashboards
│   ├── frontend/                   # Nuxt 4 frontend application
│   │   ├── app/
│   │   │   ├── pages/              # File-based routing
│   │   │   ├── components/         # Reusable Vue components
│   │   │   ├── composables/        # API hooks
│   │   │   ├── stores/             # Pinia stores (auth, cart)
│   │   │   ├── middleware/         # Route guards
│   │   │   └── layouts/            # Page layouts
│   │   ├── types/
│   │   │   └── api.d.ts           # Auto-generated OpenAPI types
│   │   └── utils/
│   │       └── api-client.ts      # Configured API client
│   └── nginx/                      # Nginx reverse proxy
│       ├── nginx.conf              # Proxy configuration
│       └── README.md
├── docs/
│   └── adr/                        # Architecture Decision Records
├── docker-compose.yml              # Full stack orchestration
├── init-db.sql                     # Schema initialization
└── README.md
```

## Module Structure (Vertical Slice)

Each module follows this structure:

```
module/
├── api/                            # Presentation layer
│   ├── controllers/                # REST endpoints
│   └── dtos/                       # Zod validation schemas
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
// orders/api/dtos/order.dto.ts
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
- Delivery address management (multiple addresses per customer)
- Favorite restaurants management
- Listens to `UserRegisteredEvent` via ACL to auto-create customer profile

### Restaurants Module
- Restaurant CRUD operations
- Menu item management
- Categories: appetizer, main_course, dessert, beverage, side
- Order confirmation/rejection workflow

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

### Notifications Module
- Event-driven notification system
- Listens to `OrderStatusChangedEvent` and `PaymentSucceededEvent`
- Sends notifications to customers and restaurants
- Uses Anti-Corruption Layer to map external events

### Orders Module
- Order creation from cart (via ACL)
- Order status workflow:
  - pending → payment_succeeded → confirmed → preparing → ready_for_pickup → in_transit → delivered
  - Cancellation possible from: pending, payment_succeeded, confirmed, preparing, ready_for_pickup
- Payment processing via Payment Gateway
- Driver acceptance (drivers choose orders when status is ready_for_pickup)
- Order cancellation with reason tracking

---

## Monitoring & Observability

The application includes comprehensive monitoring with Pino for structured logging and Prometheus/Grafana for metrics visualization.

### Logging (Pino)

- **Structured JSON logs** in production, pretty-printed in development
- **Correlation IDs** via `x-request-id` header for request tracing
- **Automatic redaction** of sensitive data (passwords, tokens, cookies)
- **Log levels** configurable via `LOG_LEVEL` environment variable

### Metrics (Prometheus)

Metrics are exposed at `/api/metrics` endpoint. Available metrics include:

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
# - Application: http://ds.localhost (via nginx)
# - API: http://ds.localhost/api
# - Prometheus: http://localhost:9095
# - Grafana: http://localhost:3001
# - RabbitMQ Management: http://localhost:15672
# - Metrics endpoint: http://ds.localhost/api/metrics
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

This will start all services:
- **nginx** - Reverse proxy on port 80
- **frontend** - Nuxt SSR application
- **delivery-service** - NestJS backend API  
- **postgres** - PostgreSQL database on port 5433
- **rabbitmq** - Message broker (ports 5672, 15672)
- **prometheus** - Metrics collection on port 9095
- **grafana** - Monitoring dashboards on port 3001

3. Run migrations (happens automatically on backend startup, but can be run manually):
```bash
cd apps/delivery-service
pnpm migrate
```

4. Access the application:
- **Frontend**: http://ds.localhost
- **API Docs**: http://ds.localhost/api/docs
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9095
- **RabbitMQ**: http://localhost:15672

### Local Development (without Docker)

1. Start infrastructure only:
```bash
docker-compose up -d postgres rabbitmq prometheus grafana
```

2. Start backend:
```bash
cd apps/delivery-service
pnpm dev
```

3. Start frontend:
```bash
cd apps/frontend
pnpm dev
```

Backend runs on `http://localhost:3000`, frontend on `http://localhost:3000` (port may vary).

### API Documentation

Swagger UI is available at:
- **Docker**: http://ds.localhost/api/docs
- **Local**: http://localhost:3000/api/docs

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user (public)
- `POST /api/auth/login` - Login (public)
- `POST /api/auth/refresh` - Refresh access token (public)
- `GET /api/auth/me` - Get current user info
- `PATCH /api/auth/users/:userId/role` - Update user role (admin)

### Customers
- `GET /api/customers` - List all customers (admin)
- `GET /api/customers/me` - Get current customer profile
- `GET /api/customers/:id` - Get customer by ID (admin)
- `POST /api/customers` - Create customer (admin)
- `PUT /api/customers/me` - Update current profile
- `PUT /api/customers/:id` - Update customer (admin)
- `POST /api/customers/me/addresses` - Add delivery address
- `DELETE /api/customers/me/addresses/:addressId` - Remove address
- `GET /api/customers/me/favorites` - Get favorite restaurants
- `POST /api/customers/me/favorites/:restaurantId` - Add to favorites
- `DELETE /api/customers/me/favorites/:restaurantId` - Remove from favorites

### Restaurants
- `GET /api/restaurants` - List active restaurants (public)
- `GET /api/restaurants/all` - List all restaurants including inactive (admin)
- `GET /api/restaurants/:id` - Get restaurant details (public)
- `POST /api/restaurants` - Create restaurant (admin/restaurant_owner)
- `PUT /api/restaurants/:id` - Update restaurant (admin/restaurant_owner)
- `POST /api/restaurants/:id/activate` - Activate restaurant
- `POST /api/restaurants/:id/deactivate` - Deactivate restaurant
- `POST /api/restaurants/:restaurantId/orders/:orderId/confirm` - Confirm order
- `POST /api/restaurants/:restaurantId/orders/:orderId/reject` - Reject order

### Menu Items
- `GET /api/restaurants/:restaurantId/menu` - Get available menu items (public)
- `GET /api/restaurants/:restaurantId/menu/all` - Get all menu items (admin/owner)
- `POST /api/restaurants/:restaurantId/menu` - Create menu item (admin/owner)
- `PUT /api/restaurants/:restaurantId/menu/:id` - Update menu item
- `DELETE /api/restaurants/:restaurantId/menu/:id` - Delete menu item

### Drivers
- `GET /api/drivers` - List all drivers (admin)
- `GET /api/drivers/available` - List available drivers (admin/restaurant_owner)
- `GET /api/drivers/me` - Get current driver profile
- `GET /api/drivers/:id` - Get driver by ID (admin)
- `POST /api/drivers` - Register as driver
- `PUT /api/drivers/me` - Update current profile
- `PATCH /api/drivers/me/location` - Update location
- `PATCH /api/drivers/me/availability` - Set availability status
- `PATCH /api/drivers/me/deactivate` - Deactivate own account
- `PATCH /api/drivers/:id/deactivate` - Deactivate driver (admin)

### Carts
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item
- `PATCH /api/cart/items` - Update quantity
- `DELETE /api/cart/items` - Remove item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/checkout` - Checkout cart (creates order)

### Orders
- `POST /api/orders` - Create order directly (customer)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/my-deliveries` - Get driver deliveries (driver)
- `GET /api/orders/available` - Get available orders for pickup (driver)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/pay` - Pay for order (customer)
- `POST /api/orders/:id/accept` - Accept order for delivery (driver)
- `PATCH /api/orders/:id/status` - Update status (admin/restaurant_owner/driver)
- `POST /api/orders/:id/cancel` - Cancel order (customer/admin/restaurant_owner)

---

## User Roles

- `customer` - Can browse restaurants, manage cart, place orders
- `driver` - Can see available orders, accept and deliver
- `restaurant_owner` - Can manage restaurant and menu
- `admin` - Full access to all operations

---

## Testing the Application

### Setting Up the Environment

1. **Add domain to hosts file**:
   ```bash
   echo "127.0.0.1 ds.localhost" | sudo tee -a /etc/hosts
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

   Expected services:
   - `nginx` - Reverse proxy (port 80)
   - `frontend` - Nuxt SSR application (internal)
   - `delivery-service` - NestJS backend API (internal)
   - `postgres` - PostgreSQL database (port 5433)
   - `rabbitmq` - Message broker (ports 5672, 15672)
   - `prometheus` - Metrics collection (port 9095)
   - `grafana` - Monitoring dashboards (port 3001)

### Test Credentials

The database migrations automatically seed test accounts for all roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@delivery.local | Admin123! | Full system access |
| **Customer** | customer@delivery.local | Customer123! | Customer account for testing orders |
| **Driver** | driver@delivery.local | Driver123! | Driver account for testing deliveries |
| **Restaurant Owner** | owner@delivery.local | Owner123! | Owner account for managing restaurants |

### Access Points

| Service | URL | Credentials (if required) |
|---------|-----|---------------------------|
| Frontend | http://ds.localhost | Use test accounts above |
| API Docs | http://ds.localhost/api/docs | - |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| Prometheus | http://localhost:9095 | - |
| Grafana | http://localhost:3001 | admin / admin |

### Testing Order Flow (End-to-End)

1. **Customer creates order**:
   - Login as `customer@delivery.local`
   - Browse restaurants and add items to cart
   - Checkout cart → order created with status `pending`

2. **Restaurant confirms order**:
   - Login as `owner@delivery.local`
   - Navigate to restaurant orders
   - Confirm order → status changes to `confirmed`

3. **Customer pays for order**:
   - Login as `customer@delivery.local`
   - Navigate to orders and pay → status changes to `paid`

4. **Driver accepts delivery**:
   - Login as `driver@delivery.local`
   - View available orders
   - Accept order → status changes to `picked_up`

5. **Driver delivers order**:
   - Update status to `on_the_way`
   - Update status to `delivered`
   - Order complete

### API Testing with Swagger

1. Navigate to http://ds.localhost/api/docs
2. Login with any test account to get JWT token
3. Click "Authorize" button
4. Insert the Token
5. Try endpoints based on role permissions

### Monitoring & Observability

**Prometheus Metrics** (http://localhost:9095):
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `db_query_duration_seconds` - Database query performance
- Custom business metrics per module

**Grafana Dashboards** (http://localhost:3001):
- Pre-configured dashboards for API performance
- Database query monitoring
- Order flow metrics
- Driver availability tracking

**RabbitMQ Management** (http://localhost:15672):
- View message queues and exchanges
- Monitor event flow between modules
- Check message rates and consumers

---

## Default Test Credentials

After running migrations and seed data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.local | Admin123! |
| Customer | customer@delivery.local | Customer123! |
| Driver | driver@delivery.local | Driver123! |
| Restaurant Owner | owner@delivery.local | Owner123! |

---

## Currency

The default currency across the system is **EUR** (Euro).

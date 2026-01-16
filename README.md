# Delivery Service - Modular Monolith

A food delivery service system built with NestJS using modern architecture patterns:

- **Modular Monolith** - Isolated modules that can evolve into microservices
- **Vertical Slice Architecture** - Each module contains all layers (API, Application, Core, Infrastructure)
- **Clean Architecture** - Dependency inversion with clear layer separation
- **CQRS** - Command Query Responsibility Segregation using @nestjs/cqrs
- **Event-Driven Architecture** - Domain events published via RabbitMQ
- **Aggregate Root Pattern** - Domain entities with business logic encapsulation

## Project Structure

```
solution-project/
├── apps/
│   └── delivery-service/           # Main NestJS application
│       └── src/
│           ├── infrastructure/     # App-level infrastructure
│           ├── modules/
│           │   ├── shared-kernel/  # Cross-cutting concerns
│           │   ├── auth/           # Authentication module
│           │   ├── customers/      # Customer management
│           │   ├── restaurants/    # Restaurant & menu management
│           │   ├── drivers/        # Driver management
│           │   ├── carts/          # Shopping cart
│           │   ├── orders/         # Order management
│           │   └── health/         # Health check
│           ├── migrations/         # Database migrations runner
│           ├── app.module.ts
│           └── main.ts
├── docker-compose.yml              # PostgreSQL + RabbitMQ
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
    └── database/
        ├── migrations/             # Kysely migrations
        └── repositories/           # Repository implementations
```

## Modules

### Auth Module
- User registration and login
- JWT token management
- Password hashing with scrypt
- Publishes `UserRegisteredEvent` for other modules

### Customers Module
- Customer profile management
- Delivery address management
- Listens to `UserRegisteredEvent` (anti-corruption layer)

### Restaurants Module
- Restaurant CRUD operations
- Menu item management
- Categories: appetizer, main_course, dessert, beverage, side

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

### Orders Module
- Order creation from cart
- Order status workflow:
  - pending → confirmed → preparing → ready_for_pickup → driver_assigned → picked_up → in_transit → delivered
- Driver acceptance (drivers choose orders)
- Order cancellation

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

## Technology Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 17 with Kysely (type-safe SQL builder)
- **Message Queue**: RabbitMQ with @golevelup/nestjs-rabbitmq
- **Authentication**: JWT with Passport.js
- **Validation**: Zod with nestjs-zod
- **Build**: Turbo (monorepo build orchestration)
- **Package Manager**: pnpm

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

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/available` - Get available orders (driver)
- `POST /api/orders/:id/accept` - Accept order (driver)
- `PATCH /api/orders/:id/status` - Update status
- `POST /api/orders/:id/cancel` - Cancel order

## User Roles

- `customer` - Can browse restaurants, manage cart, place orders
- `driver` - Can see available orders, accept and deliver
- `restaurant_owner` - Can manage restaurant and menu
- `admin` - Full access to all operations

# Delivery Service - Modular Monolith

A food delivery service system built with NestJS using modern architecture patterns:

- **Modular Monolith** - Isolated modules that can evolve into microservices
- **Vertical Slice Architecture** - Each module contains all layers (API, Application, Core, Infrastructure)
- **Clean Architecture** - Dependency inversion with clear layer separation
- **CQRS** - Command Query Responsibility Segregation using @nestjs/cqrs
- **Event-Driven Architecture** - Domain events published via RabbitMQ
- **Aggregate Root Pattern** - Domain entities with business logic encapsulation

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 11 |
| Database | PostgreSQL 17 |
| ORM | Kysely |
| Message Queue | RabbitMQ |
| Authentication | Passport.js + JWT |
| Validation | Zod + nestjs-zod |
| Logging | Pino |
| Metrics | Prometheus + Grafana |
| Build Tool | Turbo + pnpm |
| API Docs | Swagger/OpenAPI |

## Project Structure

```
solution-project/
├── apps/
│   └── delivery-service/           # Main NestJS application
│       ├── src/
│       │   ├── infrastructure/     # App-level infrastructure
│       │   ├── modules/
│       │   │   ├── shared-kernel/  # Cross-cutting concerns
│       │   │   ├── auth/           # Authentication
│       │   │   ├── customers/      # Customer management
│       │   │   ├── restaurants/    # Restaurant & menu
│       │   │   ├── drivers/        # Driver management
│       │   │   ├── carts/          # Shopping cart
│       │   │   ├── orders/         # Order management
│       │   │   ├── notifications/  # Event-driven notifications
│       │   │   └── health/         # Health check
│       │   └── migrations/         # Database migrations
│       ├── prometheus.yml
│       └── grafana/
├── docker-compose.yml
└── init-db.sql
```

## Module Structure (Vertical Slice)

```
module/
├── api/                    # Controllers, DTOs
├── application/            # Commands, Queries, Event handlers
├── core/                   # Aggregates, Entities, Events, Repository interfaces
└── infrastructure/         # Config, ACL mappers, Repository implementations
```

## Getting Started

```bash
docker-compose up -d
```

This starts the entire stack (app, database, RabbitMQ, Prometheus, Grafana). Migrations run automatically.

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Grafana**: http://localhost:3001

## Documentation

| Document | Description |
|----------|-------------|
| [DOCKER_STARTUP.md](DOCKER_STARTUP.md) | Docker Compose setup, ports, useful commands |
| [SEEDED_DATA.md](SEEDED_DATA.md) | Test credentials and seeded data |
| [ARCHITECTURE.md](ARCHITECTURE.md) | CQRS, Events, ACL, Kysely, Modules |
| [API.md](API.md) | API endpoints reference |

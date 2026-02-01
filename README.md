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
| Backend Framework | NestJS 11 |
| **Frontend Framework** | Nuxt 4 | Vue 3 SSR framework with file-based routing |
| **UI Components** | Vue 3 + Bootstrap 5 | Reactive components with responsive styling |
| **State Management** | Pinia | Vue store for auth and cart state |
| **API Client** | openapi-fetch | Type-safe API client from OpenAPI schema |
| **Data Fetching** | TanStack Query | Server state management with caching |
| Database | PostgreSQL 17 |
| ORM | Kysely |
| Message Queue | RabbitMQ |
| Authentication | Passport.js + JWT |
| Validation | Zod + nestjs-zod |
| Logging | Pino |
| Metrics | Prometheus + Grafana |
| **Reverse Proxy** | Nginx | Unified domain routing and load balancing |
| **Containerization** | Docker + Compose | Multi-container orchestration |
| Build Tool | Turbo + pnpm |
| API Docs | Swagger/OpenAPI |

## Project Structure

```
delivery-service/
├── apps/
│   ├── delivery-service/           # Main NestJS application
│   │   ├── src/
│   │   │   ├── infrastructure/     # App-level infrastructure
│   │   │   ├── modules/
│   │   │   │   ├── shared-kernel/  # Cross-cutting concerns
│   │   │   │   ├── auth/           # Authentication
│   │   │   │   ├── customers/      # Customer management
│   │   │   │   ├── restaurants/    # Restaurant & menu management
│   │   │   │   ├── drivers/        # Driver management
│   │   │   │   ├── carts/          # Shopping cart
│   │   │   │   ├── orders/         # Order management
│   │   │   │   ├── notifications/  # Event-driven notifications
│   │   │   │   └── health/         # Health check
│   │   │   ├── migrations/         # Database migrations runner
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prometheus.yml          # Prometheus scrape config
│   │   └── grafana/                # Grafana provisioning
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

This starts the entire stack (app, database, RabbitMQ, Prometheus, Grafana, frontend, nginx). Migrations run automatically.

- **API**: http://localhost:3000 or http://ds.localhost/api
- **Frontend**: http://localhost:3002 (port may vary) or http://ds.localhost
- **Swagger Docs**: http://localhost:3000/api/docs or http://ds.localhost/api/docs
- **Grafana**: http://localhost:3001


## Default Test Credentials

After running migrations and seed data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.local | Admin123! |
| Customer | customer@delivery.local | Customer123! |
| Driver | driver@delivery.local | Driver123! |
| Restaurant Owner | owner@delivery.local | Owner123! |


## Documentation

| Document | Description |
|----------|-------------|
| [DOCKER_STARTUP.md](DOCKER_STARTUP.md) | Docker Compose setup, ports, useful commands |
| [SEEDED_DATA.md](SEEDED_DATA.md) | Test credentials and seeded data |
| [ARCHITECTURE.md](ARCHITECTURE.md) | CQRS, Events, ACL, Kysely, Modules |
| [API.md](API.md) | API endpoints reference |

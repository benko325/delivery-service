# ADR-002: Vertical Slice Architecture

## Status
**Accepted** - 2025-01-16

## Context

Within each module, we need to organize code in a way that:
- Makes features easy to understand and modify
- Reduces coupling between components
- Supports the CQRS pattern
- Aligns with Clean Architecture principles

Traditional layered architecture (Controllers → Services → Repositories) creates horizontal coupling where changes to a feature require modifications across multiple layers.

## Decision

We will use **Vertical Slice Architecture** where each module is organized by feature/capability rather than technical layer.

### Module Structure
```
module/
├── api/                            # Presentation layer
│   ├── controllers/                # REST endpoints
│   └── dtos/                       # Zod validation schemas
├── application/                    # Application layer
│   ├── commands/                   # Command handlers (write)
│   │   └── create-order/
│   │       ├── create-order.command.ts
│   │       └── create-order.handler.ts
│   ├── queries/                    # Query handlers (read)
│   │   └── get-order/
│   │       ├── get-order.query.ts
│   │       └── get-order.handler.ts
│   └── events/                     # Event handlers (ACL)
├── core/                           # Domain layer
│   ├── aggregates/                 # Aggregate roots
│   ├── entities/                   # Entity interfaces
│   ├── events/                     # Domain events
│   ├── repositories/               # Repository interfaces
│   └── types/                      # Domain types
└── infrastructure/                 # Infrastructure layer
    ├── config/                     # Module configuration
    ├── anti-corruption-layer/      # External event mappers
    └── database/
        ├── migrations/             # Kysely migrations
        └── repositories/           # Repository implementations
```

### Layer Dependencies (Dependency Rule)
```
API → Application → Core ← Infrastructure
                     ↑
         Infrastructure implements Core interfaces
```

## Consequences

### Positive
- **Feature cohesion** - All code for a feature is in one place
- **Easy navigation** - Find everything related to "create order" in one folder
- **Independent features** - Changes to one feature don't affect others
- **Clear boundaries** - Each slice has explicit inputs and outputs
- **Testability** - Can test features in isolation
- **Supports CQRS** - Natural separation of commands and queries

### Negative
- **Code duplication** - Similar patterns repeated across slices
- **More files** - Each command/query gets its own folder
- **Learning curve** - Team needs to understand the pattern

### Mitigations
- Use code generators for common patterns
- Document conventions in README files
- Create templates for new commands/queries

## References
- [Vertical Slice Architecture - Jimmy Bogard](https://jimmybogard.com/vertical-slice-architecture/)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

# ADR-001: Modular Monolith Architecture

## Status
**Accepted** - 2025-01-16

## Context

We need to build a food delivery service that handles multiple business domains:
- User authentication and authorization
- Customer management
- Restaurant and menu management
- Shopping cart functionality
- Order processing and delivery tracking
- Driver management

The team considered three architectural approaches:

1. **Traditional Monolith** - Single codebase with shared models and database
2. **Microservices** - Separate deployable services for each domain
3. **Modular Monolith** - Single deployable unit with isolated modules

### Constraints
- Small development team (2-3 developers)
- Need for rapid iteration and feature development
- Limited DevOps resources for managing distributed systems
- Future scalability requirements uncertain

## Decision

We will use a **Modular Monolith** architecture with the following characteristics:

1. **Single Deployable Unit** - One NestJS application containing all modules
2. **Isolated Bounded Contexts** - Each business domain is a separate module with clear boundaries
3. **Loose Coupling** - Modules communicate via events, not direct imports
4. **Shared Kernel** - Common infrastructure (database, messaging, guards) extracted to shared module

### Module Structure
```
modules/
├── shared-kernel/    # Cross-cutting concerns
├── auth/             # Authentication bounded context
├── customers/        # Customer bounded context
├── restaurants/      # Restaurant bounded context
├── drivers/          # Driver bounded context
├── carts/            # Cart bounded context
├── orders/           # Order bounded context
├── notifications/    # Event-driven notifications
└── health/           # Health checks
```

## Consequences

### Positive
- **Simpler deployment** - Single Docker container, single deployment pipeline
- **Easier debugging** - All code in one process, simpler stack traces
- **Faster development** - No network latency between modules, easier refactoring
- **Lower operational complexity** - No service mesh, no distributed tracing required
- **Future-proof** - Modules can be extracted to microservices if needed
- **Transaction support** - Can use database transactions across modules if necessary

### Negative
- **Scaling limitations** - Cannot scale modules independently
- **Technology lock-in** - All modules must use same language/framework
- **Deployment coupling** - Change in one module requires full redeployment
- **Risk of coupling** - Developers might be tempted to bypass module boundaries

### Mitigations
- Enforce module boundaries through code reviews and linting
- Use event-driven communication to maintain loose coupling
- Design modules as if they were separate services (own database schema, own types)

## References
- [Modular Monolith: A Primer](https://www.kamilgrzybek.com/design/modular-monolith-primer/)
- [MonolithFirst - Martin Fowler](https://martinfowler.com/bliki/MonolithFirst.html)

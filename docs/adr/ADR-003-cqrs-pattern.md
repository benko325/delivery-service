# ADR-003: CQRS Pattern with NestJS

## Status
**Accepted** - 2025-01-16

## Context

The application needs to handle complex business operations with different read and write patterns:
- **Writes** require business validation, state changes, and event publishing
- **Reads** require optimized queries, potentially denormalized data

Traditional CRUD services mix these concerns, leading to:
- Complex service methods that do too much
- Difficulty optimizing reads without affecting writes
- Hard to add event sourcing or audit logging

## Decision

We will implement **CQRS (Command Query Responsibility Segregation)** using the `@nestjs/cqrs` package.

### Implementation

**Commands (Write Operations):**
```typescript
// Command definition
export class CreateOrderCommand implements ICommand {
    constructor(
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly items: OrderItem[],
        // ...
    ) {}
}

// Command handler
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
    async execute(command: CreateOrderCommand) {
        const aggregate = this.publisher.mergeObjectContext(new OrderAggregate());
        aggregate.create(command.customerId, ...);
        await this.repository.save(aggregate);
        aggregate.commit(); // Publish events
        return { id: aggregate.id };
    }
}
```

**Queries (Read Operations):**
```typescript
// Query definition
export class GetOrdersByCustomerQuery implements IQuery {
    constructor(public readonly customerId: string) {}
}

// Query handler
@QueryHandler(GetOrdersByCustomerQuery)
export class GetOrdersByCustomerHandler implements IQueryHandler<GetOrdersByCustomerQuery> {
    async execute(query: GetOrdersByCustomerQuery) {
        return this.repository.findByCustomerId(query.customerId);
    }
}
```

**Controller Integration:**
```typescript
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    async create(@Body() dto: CreateOrderDto) {
        return this.commandBus.execute(new CreateOrderCommand(...));
    }

    @Get('my-orders')
    async getMyOrders(@User() user: RequestUser) {
        return this.queryBus.execute(new GetOrdersByCustomerQuery(user.userId));
    }
}
```

## Consequences

### Positive
- **Separation of concerns** - Read and write logic are clearly separated
- **Scalability** - Can optimize reads and writes independently
- **Testability** - Commands and queries are easy to unit test
- **Event integration** - Natural fit for event-driven architecture
- **Audit trail** - Commands provide clear record of user intentions

### Negative
- **More boilerplate** - Each operation requires command/query + handler
- **Complexity** - Simple CRUD operations become more verbose
- **Learning curve** - Team needs to understand CQRS concepts

### Trade-offs
- We accept the additional boilerplate for the benefits of separation
- For very simple modules, we still use CQRS for consistency

## References
- [CQRS - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)

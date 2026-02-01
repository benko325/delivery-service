# ADR-007: Aggregate Root Pattern (DDD)

## Status
**Accepted** - 2025-01-16

## Context

We need to encapsulate business logic and ensure data consistency. Traditional service-layer approaches lead to:
- Anemic domain models (data objects with no behavior)
- Business logic scattered across services
- Difficulty ensuring invariants

### Requirements
- Business logic encapsulated in domain objects
- Consistent state transitions
- Support for domain events
- Clear aggregate boundaries

## Decision

We will implement the **Aggregate Root** pattern from Domain-Driven Design (DDD) using `@nestjs/cqrs` AggregateRoot base class.

### Implementation

**Aggregate Root Structure:**
```typescript
export class OrderAggregate extends AggregateRoot {
    // Private state
    private _id: string;
    private _customerId: string;
    private _status: OrderStatus = 'pending';
    private _items: OrderItem[] = [];

    // Public getters (read-only access)
    get id(): string { return this._id; }
    get status(): OrderStatus { return this._status; }

    // Business methods (state mutations + events)
    create(customerId: string, restaurantId: string, items: OrderItem[], ...) {
        this._id = crypto.randomUUID();
        this._customerId = customerId;
        this._items = items;
        this._status = 'pending';

        // Apply domain event
        this.apply(new OrderCreatedEvent({
            id: this._id,
            customerId,
            items,
            status: this._status,
        }));
    }

    updateStatus(newStatus: OrderStatus) {
        // Business rule: validate status transition
        if (!this.isValidTransition(this._status, newStatus)) {
            throw new Error(`Invalid transition: ${this._status} → ${newStatus}`);
        }

        const previousStatus = this._status;
        this._status = newStatus;

        this.apply(new OrderStatusChangedEvent({
            orderId: this._id,
            previousStatus,
            newStatus,
        }));
    }

    // State loading (from database)
    loadState(data: Order) {
        this._id = data.id;
        this._customerId = data.customerId;
        this._status = data.status;
        this._items = data.items;
    }
}
```

**Usage in Command Handler:**
```typescript
@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler {
    async execute(command: UpdateOrderStatusCommand) {
        // Load aggregate
        const order = await this.repository.findById(command.orderId);
        const aggregate = this.publisher.mergeObjectContext(new OrderAggregate());
        aggregate.loadState(order);

        // Execute business logic
        aggregate.updateStatus(command.newStatus);

        // Persist and publish events
        await this.repository.update(aggregate);
        aggregate.commit(); // Publishes OrderStatusChangedEvent
    }
}
```

### Aggregates in the System

| Aggregate | Bounded Context | Key Business Rules |
|-----------|-----------------|-------------------|
| **AuthAggregate** | Auth | Password hashing, token generation |
| **CustomerAggregate** | Customers | Profile management, address updates |
| **OrderAggregate** | Orders | Status state machine, driver assignment |
| **CartAggregate** | Carts | Single restaurant rule, quantity management |
| **DriverAggregate** | Drivers | Availability status, location tracking |
| **RestaurantAggregate** | Restaurants | Active/inactive state |
| **MenuItemAggregate** | Restaurants | Availability, pricing |

### Order Status State Machine
```
pending → payment_succeeded → confirmed → preparing → ready_for_pickup → in_transit → delivered
   │              │               │            │               │
   └──────────────┴───────────────┴────────────┴───────────────┴──→ cancelled

Valid transitions:
- pending → payment_succeeded, cancelled
- payment_succeeded → confirmed, cancelled
- confirmed → preparing, cancelled
- preparing → ready_for_pickup, cancelled
- ready_for_pickup → in_transit, cancelled
- in_transit → delivered
- delivered, cancelled → (terminal states)
```

## Consequences

### Positive
- **Encapsulated logic** - Business rules live in the domain
- **Invariant protection** - Aggregates ensure valid state
- **Event sourcing ready** - Events capture all state changes
- **Self-documenting** - Aggregate methods describe capabilities
- **Testable** - Business logic can be unit tested without infrastructure

### Negative
- **Complexity** - More classes than anemic models
- **Learning curve** - Team needs DDD knowledge
- **Repository split** - Need separate aggregate and query repositories

### Trade-offs
- We accept additional complexity for business logic clarity
- State machine validation prevents invalid orders

## References
- [Aggregate Pattern - Martin Fowler](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [NestJS CQRS AggregateRoot](https://docs.nestjs.com/recipes/cqrs#events)

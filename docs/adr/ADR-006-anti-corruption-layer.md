# ADR-006: Anti-Corruption Layer Pattern

## Status
**Accepted** - 2025-01-16

## Context

When modules communicate via events, they might expose internal domain types that could create coupling between bounded contexts. For example:
- Auth module's `UserRegisteredEvent` contains auth-specific types
- Carts module's `CartOrderedEvent` contains cart-specific types

If the Orders module directly uses `CartItem` from Carts, it becomes coupled to Carts' internal model. Changes to Carts would break Orders.

## Decision

We will implement the **Anti-Corruption Layer (ACL)** pattern to isolate bounded contexts.

### Implementation

**Location:** Each module has ACL handlers in `infrastructure/anti-corruption-layer/` or `application/events/`

**Example: Carts → Orders Event Mapping**

```typescript
// orders/infrastructure/anti-corruption-layer/cart-ordered.mapper.ts
@EventsHandler(CartOrderedEvent)
export class CartOrderedEventHandler implements IEventHandler<CartOrderedEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    async handle(event: CartOrderedEvent): Promise<void> {
        // ACL: Map Carts domain types → Orders domain types
        const orderItems: OrderItem[] = event.items.map(cartItem => ({
            menuItemId: cartItem.menuItemId,
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
            currency: cartItem.currency,
            // Note: restaurantId not copied (it's on the order level)
        }));

        const deliveryAddress: DeliveryAddress = {
            street: event.deliveryAddress.street,
            city: event.deliveryAddress.city,
            postalCode: event.deliveryAddress.postalCode,
            country: event.deliveryAddress.country,
        };

        // Execute internal command with Orders domain types
        await this.commandBus.execute(
            new CreateOrderCommand(
                event.customerId,
                event.restaurantId,
                orderItems,        // Orders.OrderItem[], not Carts.CartItem[]
                deliveryAddress,   // Orders.DeliveryAddress
                event.totalAmount,
                event.deliveryFee,
                event.currency,
            )
        );
    }
}
```

**Example: Auth → Customers Event Mapping**

```typescript
// customers/infrastructure/anti-corruption-layer/user-registered.mapper.ts
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
    async handle(event: UserRegisteredEvent): Promise<void> {
        // Only process if user has customer role
        if (event.roles.includes('customer')) {
            await this.commandBus.execute(
                new CreateCustomerCommand(
                    event.id,      // Auth.userId → Customers.userId
                    event.email,
                    event.name,
                    event.phone,
                )
            );
        }
    }
}
```

### Data Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                         CARTS MODULE                                │
│   CartAggregate.checkout() → CartOrderedEvent (Carts types)        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ RabbitMQ
                                 ▼
┌────────────────────────────────┴────────────────────────────────────┐
│                         ORDERS MODULE                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              Anti-Corruption Layer (ACL)                    │   │
│   │                                                             │   │
│   │   CartOrderedEventHandler                                   │   │
│   │   ├── Receives: CartOrderedEvent (Carts domain types)      │   │
│   │   ├── Maps: CartItem[] → OrderItem[]                       │   │
│   │   └── Executes: CreateOrderCommand (Orders domain types)   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   OrderAggregate.create() → Order saved                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- **Module isolation** - Each module has its own domain types
- **Independent evolution** - Carts can change without breaking Orders
- **Clear boundaries** - Explicit translation between contexts
- **Testability** - ACL handlers can be unit tested in isolation
- **Documentation** - ACL shows exactly how modules interact

### Negative
- **Boilerplate** - Need mapping code for each cross-module event
- **Duplication** - Similar types exist in multiple modules (by design)
- **Complexity** - Additional layer to understand and maintain

### Trade-offs
- We accept type duplication for the benefit of loose coupling
- Each module owns its types and can evolve them independently

## References
- [Anti-Corruption Layer - Microsoft](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)

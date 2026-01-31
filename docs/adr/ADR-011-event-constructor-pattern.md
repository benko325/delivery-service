# ADR-011: Object Constructor Pattern for Events

## Status
**Accepted** - 2025-01-30

## Context

When events are published via RabbitMQ, they are serialized to JSON and deserialized on the receiving end. The original implementation used positional constructor parameters:

```typescript
// Original pattern - PROBLEMATIC
export class UserRegisteredEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        public readonly phone: string,
        public readonly roles: UserRole[],
    ) {}
}

// Publishing
aggregate.apply(new UserRegisteredEvent(id, email, name, phone, roles));
```

**Problem:** When deserializing JSON from RabbitMQ, we get a plain object:
```json
{ "id": "...", "email": "...", "name": "...", "phone": "...", "roles": [...] }
```

Reconstructing the event requires knowing the parameter order:
```typescript
// In subscriber - error-prone!
new UserRegisteredEvent(data.id, data.email, data.name, data.phone, data.roles);
```

If event properties are added/removed/reordered, deserialization breaks.

## Decision

We will use **Object Constructor Pattern** for all domain events, accepting a single data object.

### Implementation

**Event Definition:**
```typescript
export class UserRegisteredEvent implements IEvent {
    public readonly id: string;
    public readonly email: string;
    public readonly name: string;
    public readonly phone: string;
    public readonly roles: UserRole[];

    constructor(data: {
        id: string;
        email: string;
        name: string;
        phone: string;
        roles: UserRole[];
    }) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.phone = data.phone;
        this.roles = data.roles;
    }
}
```

**Publishing (in Aggregate):**
```typescript
this.apply(new UserRegisteredEvent({
    id: this._id,
    email: this._email,
    name: this._name,
    phone: this._phone,
    roles: this._roles,
}));
```

**Subscriber Deserialization:**
```typescript
// In RabbitMQSubscriber
async (message) => {
    const parsedJson = JSON.parse(message);
    // Direct construction - parsedJson is already the data object!
    const receivedEvent = new Event(parsedJson);
    this.bridge.next(receivedEvent);
}
```

**Type Coercion for Dates:**
```typescript
export class CartOrderedEvent implements IEvent {
    public readonly orderedAt: Date;

    constructor(data: { orderedAt: Date; /* ... */ }) {
        // Handle both Date object and ISO string
        this.orderedAt = data.orderedAt instanceof Date
            ? data.orderedAt
            : new Date(data.orderedAt);
    }
}
```

### Events Updated

All domain events in the system follow this pattern:

**Auth Module:**
- `UserRegisteredEvent`

**Customers Module:**
- `CustomerCreatedEvent`, `CustomerUpdatedEvent`
- `CustomerAddressAddedEvent`, `CustomerAddressUpdatedEvent`, `CustomerAddressRemovedEvent`
- `RestaurantAddedToFavoritesEvent`, `RestaurantRemovedFromFavoritesEvent`

**Orders Module:**
- `OrderCreatedEvent`, `OrderStatusChangedEvent`, `OrderAcceptedByDriverEvent`
- `PaymentSucceededEvent`

**Carts Module:**
- `CartItemAddedEvent`, `CartClearedEvent`, `CartOrderedEvent`

**Drivers Module:**
- `DriverCreatedEvent`, `DriverAvailabilityChangedEvent`, `DriverLocationUpdatedEvent`

**Restaurants Module:**
- `RestaurantCreatedEvent`, `RestaurantDeactivatedEvent`
- `MenuItemCreatedEvent`
- `OrderConfirmedByRestaurantEvent`, `OrderRejectedByRestaurantEvent`

## Consequences

### Positive
- **Safe deserialization** - JSON object maps directly to constructor
- **Order independent** - Property names, not positions, matter
- **Self-documenting** - Constructor shows all required fields
- **IDE support** - Better autocomplete with named properties
- **Extensible** - Can add optional properties without breaking consumers

### Negative
- **More verbose** - Object literal syntax is longer
- **Refactoring needed** - All existing events required updates

### Trade-offs
- One-time refactoring effort for long-term reliability
- Slightly more code for safer serialization

## References
- [Builder Pattern for Immutable Objects](https://www.baeldung.com/java-immutable-object)
- [Event Serialization Best Practices](https://microservices.io/patterns/data/event-sourcing.html)

# ADR-005: RabbitMQ for Event-Driven Communication

## Status
**Accepted** - 2025-01-16

## Context

Modules in our modular monolith need to communicate without creating tight coupling. When a user registers in the Auth module, the Customers module needs to create a customer profile. When a cart is checked out, the Orders module needs to create an order.

### Requirements
- Loose coupling between modules
- Reliable message delivery
- Support for future microservices extraction
- Asynchronous processing capability

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Direct method calls** | Simple, synchronous | Tight coupling, no async |
| **In-memory EventEmitter** | Simple, no infrastructure | Lost on restart, no persistence |
| **RabbitMQ** | Reliable, persistent, industry standard | Additional infrastructure |
| **Redis Pub/Sub** | Fast, simple | No message persistence |
| **Kafka** | High throughput, log-based | Overkill for our scale |

## Decision

We will use **RabbitMQ** for inter-module event communication with `@golevelup/nestjs-rabbitmq`.

### Implementation

**Publisher (shared-kernel):**
```typescript
@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    async publish<T extends IEvent>(event: T): Promise<void> {
        const eventName = event.constructor.name; // e.g., "UserRegisteredEvent"
        await this.amqpConnection.publish('', eventName, JSON.stringify(event));
    }
}
```

**Subscriber (shared-kernel):**
```typescript
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
                    const event = new Event(JSON.parse(message));
                    this.bridge.next(event); // Forward to EventBus
                },
                { queue: Event.name },
            );
        }
    }
}
```

**Module Integration:**
```typescript
@Module({
    providers: [
        { provide: 'EVENTS', useValue: [UserRegisteredEvent, CartOrderedEvent] },
        RabbitMQPublisher,
        RabbitMQSubscriber,
    ],
})
export class CustomersModule implements OnModuleInit {
    async onModuleInit() {
        await this.subscriber.connect();
        this.subscriber.bridgeEventsTo(this.eventBus.subject$);
        this.eventBus.publisher = this.publisher;
    }
}
```

### Event Flow
```
Auth Module                    RabbitMQ                    Customers Module
     │                             │                              │
     │ UserRegisteredEvent         │                              │
     ├────────────────────────────►│                              │
     │                             │ Queue: UserRegisteredEvent   │
     │                             ├─────────────────────────────►│
     │                             │                              │
     │                             │           ACL Handler        │
     │                             │           CreateCustomer     │
```

## Consequences

### Positive
- **Loose coupling** - Modules don't know about each other
- **Reliability** - Messages persist until acknowledged
- **Scalability** - Easy to scale consumers
- **Future-proof** - Ready for microservices extraction
- **Visibility** - RabbitMQ Management UI for debugging

### Negative
- **Infrastructure dependency** - Requires RabbitMQ server
- **Eventual consistency** - Events are processed asynchronously
- **Complexity** - Message serialization/deserialization
- **Error handling** - Need dead letter queues for failed messages

### Mitigations
- Docker Compose includes RabbitMQ with health checks
- Structured event classes with validation
- Logging for all published/received events

## References
- [@golevelup/nestjs-rabbitmq](https://github.com/golevelup/nestjs/tree/master/packages/rabbitmq)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

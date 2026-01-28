import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { OrderStatusChangedEvent } from "../../../orders/core/events/order-status-changed.event";
import { OrderStatus } from "../../../orders/core/types/order-database.types";

export type OrderStatusMapped = OrderStatus;

export class OrderStatusChangedMappedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly previousStatus: OrderStatusMapped,
    public readonly newStatus: OrderStatusMapped,
    public readonly changedAt: Date,
  ) {}
}

@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedEventMapper implements IEventHandler<OrderStatusChangedEvent> {
  private readonly logger = new Logger(OrderStatusChangedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  async handle(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.log(
      `Mapping OrderStatusChangedEvent for order ${event.orderId}: ${event.previousStatus} → ${event.newStatus}`,
    );

    const mappedEvent = new OrderStatusChangedMappedEvent(
      event.orderId,
      event.previousStatus,
      event.newStatus,
      event.changedAt,
    );

    this.eventBus.publish(mappedEvent);

    this.logger.log(
      `Published OrderStatusChangedMappedEvent for order ${event.orderId}`,
    );
  }
}

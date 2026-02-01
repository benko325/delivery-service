import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { IEvent } from "@nestjs/cqrs";
import { OrderReadyForPickupEvent } from "@/modules/orders/core/events/order-ready-for-pickup.event";
import { DeliveryAddress } from "@/modules/orders/core/types/order-database.types";

export class OrderReadyForPickupMappedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly restaurantId: string,
    public readonly deliveryAddress: DeliveryAddress,
    public readonly readyAt: Date,
  ) {}
}

@EventsHandler(OrderReadyForPickupEvent)
export class OrderReadyForPickupEventMapper
  implements IEventHandler<OrderReadyForPickupEvent>
{
  private readonly logger = new Logger(OrderReadyForPickupEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: OrderReadyForPickupEvent): void {
    this.logger.log(
      `Mapping OrderReadyForPickupEvent for order ${event.orderId}`,
    );

    const mappedEvent = new OrderReadyForPickupMappedEvent(
      event.orderId,
      event.restaurantId,
      event.deliveryAddress,
      event.readyAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.log(`Mapped event published for order ${event.orderId}`);
  }
}

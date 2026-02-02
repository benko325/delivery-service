import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
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
export class OrderReadyForPickupEventMapper implements IEventHandler<OrderReadyForPickupEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(OrderReadyForPickupEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: OrderReadyForPickupEvent): void {
    this.logger.info(
      `Mapping OrderReadyForPickupEvent for order ${event.orderId}`,
    );

    const mappedEvent = new OrderReadyForPickupMappedEvent(
      event.orderId,
      event.restaurantId,
      event.deliveryAddress,
      event.readyAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.info(`Mapped event published for order ${event.orderId}`);
  }
}

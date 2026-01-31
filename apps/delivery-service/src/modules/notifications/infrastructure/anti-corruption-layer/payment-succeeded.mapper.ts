import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { PaymentSucceededEvent } from "../../../orders/core/events/payment-succeeded.event";

export class PaymentSucceededMappedEvent implements IEvent {
  constructor(public readonly orderId: string) {}
}

@EventsHandler(PaymentSucceededEvent)
export class PaymentSucceededEventMapper implements IEventHandler<PaymentSucceededEvent> {
  private readonly logger = new Logger(PaymentSucceededEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  async handle(event: PaymentSucceededEvent): Promise<void> {
    this.logger.log(`Mapping PaymentSucceededEvent for order ${event.orderId}`);

    const mappedEvent = new PaymentSucceededMappedEvent(event.orderId);

    this.eventBus.publish(mappedEvent);

    this.logger.log(
      `Published PaymentSucceededMappedEvent for order ${event.orderId}`,
    );
  }
}

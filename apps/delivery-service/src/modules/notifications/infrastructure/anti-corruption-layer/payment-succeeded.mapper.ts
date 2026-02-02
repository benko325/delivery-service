import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { PaymentSucceededEvent } from "../../../orders/core/events/payment-succeeded.event";

export class PaymentSucceededMappedEvent implements IEvent {
  constructor(public readonly orderId: string) {}
}

@EventsHandler(PaymentSucceededEvent)
export class PaymentSucceededEventMapper implements IEventHandler<PaymentSucceededEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(PaymentSucceededEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: PaymentSucceededEvent): Promise<void> {
    this.logger.info(
      `Mapping PaymentSucceededEvent for order ${event.orderId}`,
    );

    const mappedEvent = new PaymentSucceededMappedEvent(event.orderId);

    this.eventBus.publish(mappedEvent);

    this.logger.info(
      `Published PaymentSucceededMappedEvent for order ${event.orderId}`,
    );
  }
}

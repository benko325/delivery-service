import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { OrderCreatedEvent } from "../../core/events/order-created.event";
import { PayForOrderCommand } from "../commands/pay-for-order/pay-for-order.command";

/**
 * Automatic way of executing payment when an order is created. alternative to manual payment initiation via API
 */
@EventsHandler(OrderCreatedEvent)
export class OrderCreatedEventHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(
      `Request Payment Policy triggered for order ${event.orderId}`,
    );

    try {
      await this.commandBus.execute(
        new PayForOrderCommand(event.orderId, event.customerId),
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to handle OrderCreatedEvent for order ${event.orderId}: ${err.message}`,
        err.stack,
      );
    }
  }
}

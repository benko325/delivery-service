import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { PaymentSucceededEvent } from "../../core/events/payment-succeeded.event";
import { UpdateOrderStatusCommand } from "../commands/update-order-status/update-order-status.command";

@EventsHandler(PaymentSucceededEvent)
export class PaymentSucceededEventHandler implements IEventHandler<PaymentSucceededEvent> {
  private readonly logger = new Logger(PaymentSucceededEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: PaymentSucceededEvent): Promise<void> {
    this.logger.log(
      `Payment Succeeded Policy triggered for order ${event.orderId}`,
    );

    try {
      this.commandBus.execute(
        new UpdateOrderStatusCommand(event.orderId, "payment_succeeded"),
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to handle payment success for order ${event.orderId}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}

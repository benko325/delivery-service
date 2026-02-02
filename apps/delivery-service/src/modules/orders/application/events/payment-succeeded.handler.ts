import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { PaymentSucceededEvent } from "../../core/events/payment-succeeded.event";
import { UpdateOrderStatusCommand } from "../commands/update-order-status/update-order-status.command";

@EventsHandler(PaymentSucceededEvent)
export class PaymentSucceededEventHandler implements IEventHandler<PaymentSucceededEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(PaymentSucceededEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: PaymentSucceededEvent): Promise<void> {
    this.logger.info(
      `Payment Succeeded Policy triggered for order ${event.orderId}`,
    );

    try {
      await this.commandBus.execute(
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

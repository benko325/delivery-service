import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { PaymentSucceededMappedEvent } from "../../infrastructure/anti-corruption-layer/payment-succeeded.mapper";
import { SendRestaurantNotificationCommand } from "../commands/send-restaurant-notification/send-restaurant-notification.command";

@EventsHandler(PaymentSucceededMappedEvent)
export class PaymentSucceededEventHandler implements IEventHandler<PaymentSucceededMappedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(PaymentSucceededEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: PaymentSucceededMappedEvent): Promise<void> {
    this.logger.info(
      `Notify Restaurant Policy triggered for order ${event.orderId}`,
    );

    try {
      await this.commandBus.execute(
        new SendRestaurantNotificationCommand(event.orderId),
      );

      this.logger.info(
        `Restaurant notification sent for order ${event.orderId}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send restaurant notification for order ${event.orderId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to send restaurant notification for order ${event.orderId}: ${JSON.stringify(error)}`,
        );
      }
    }
  }
}

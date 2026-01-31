import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { PaymentSucceededMappedEvent } from "../../infrastructure/anti-corruption-layer/payment-succeeded.mapper";
import { SendRestaurantNotificationCommand } from "../commands/send-restaurant-notification/send-restaurant-notification.command";

@EventsHandler(PaymentSucceededMappedEvent)
export class PaymentSucceededEventHandler implements IEventHandler<PaymentSucceededMappedEvent> {
  private readonly logger = new Logger(PaymentSucceededEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: PaymentSucceededMappedEvent): Promise<void> {
    this.logger.log(
      `Notify Restaurant Policy triggered for order ${event.orderId}`,
    );

    try {
      await this.commandBus.execute(
        new SendRestaurantNotificationCommand(event.orderId),
      );

      this.logger.log(
        `Restaurant notification sent for order ${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send restaurant notification for order ${event.orderId}: ${error}`,
      );
    }
  }
}

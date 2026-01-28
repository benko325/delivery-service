import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { OrderStatusChangedMappedEvent } from "../../infrastructure/anti-corruption-layer/order-status-changed.mapper";
import { SendCustomerNotificationCommand } from "../commands/send-customer-notification/send-customer-notification.command";

@EventsHandler(OrderStatusChangedMappedEvent)
export class OrderStatusChangedEventHandler implements IEventHandler<OrderStatusChangedMappedEvent> {
  private readonly logger = new Logger(OrderStatusChangedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OrderStatusChangedMappedEvent): Promise<void> {
    this.logger.log(
      `Notify User of Change State Policy triggered for order ${event.orderId}: ${event.previousStatus} → ${event.newStatus}`,
    );

    try {
      await this.commandBus.execute(
        new SendCustomerNotificationCommand(
          event.orderId,
          event.previousStatus,
          event.newStatus,
          event.changedAt,
        ),
      );

      this.logger.log(
        `Customer notification sent for order ${event.orderId} status change`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send customer notification for order ${event.orderId}: ${error}`,
      );
    }
  }
}

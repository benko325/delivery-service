import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { OrderStatusChangedMappedEvent } from "../../infrastructure/anti-corruption-layer/order-status-changed.mapper";
import { SendCustomerNotificationCommand } from "../commands/send-customer-notification/send-customer-notification.command";

@EventsHandler(OrderStatusChangedMappedEvent)
export class OrderStatusChangedEventHandler implements IEventHandler<OrderStatusChangedMappedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(OrderStatusChangedEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: OrderStatusChangedMappedEvent): Promise<void> {
    this.logger.info(
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

      this.logger.info(
        `Customer notification sent for order ${event.orderId} status change`,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send customer notification for order ${event.orderId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to send customer notification for order ${event.orderId}: ${JSON.stringify(error)}`,
        );
      }
    }
  }
}

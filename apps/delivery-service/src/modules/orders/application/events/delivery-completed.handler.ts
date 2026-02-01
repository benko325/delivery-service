import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { DeliveryCompletedMappedEvent } from "../../infrastructure/anti-corruption-layer/delivery-completed.mapper";
import { UpdateOrderStatusCommand } from "../commands/update-order-status/update-order-status.command";

@EventsHandler(DeliveryCompletedMappedEvent)
export class DeliveryCompletedEventHandler
  implements IEventHandler<DeliveryCompletedMappedEvent>
{
  private readonly logger = new Logger(DeliveryCompletedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: DeliveryCompletedMappedEvent): Promise<void> {
    this.logger.log(
      `Delivery Completed Policy triggered for order ${event.orderId}`,
    );

    try {
      // Update order status to "delivered"
      await this.commandBus.execute(
        new UpdateOrderStatusCommand(event.orderId, "delivered"),
      );

      this.logger.log(
        `Order ${event.orderId} marked as delivered after completion by driver ${event.driverId}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to mark order ${event.orderId} as delivered: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to mark order ${event.orderId} as delivered: ${JSON.stringify(error)}`,
        );
      }
      throw error;
    }
  }
}

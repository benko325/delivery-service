import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { DeliveryCompletedMappedEvent } from "../../infrastructure/anti-corruption-layer/delivery-completed.mapper";
import { UpdateOrderStatusCommand } from "../commands/update-order-status/update-order-status.command";

@EventsHandler(DeliveryCompletedMappedEvent)
export class DeliveryCompletedEventHandler implements IEventHandler<DeliveryCompletedMappedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(DeliveryCompletedEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: DeliveryCompletedMappedEvent): Promise<void> {
    this.logger.info(
      `Delivery Completed Policy triggered for order ${event.orderId}`,
    );

    try {
      // Update order status to "delivered"
      await this.commandBus.execute(
        new UpdateOrderStatusCommand(event.orderId, "delivered"),
      );

      this.logger.info(
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

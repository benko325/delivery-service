import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { DeliveryAssignedMappedEvent } from "../../infrastructure/anti-corruption-layer/delivery-assigned.mapper";
import { AcceptOrderCommand } from "../commands/accept-order/accept-order.command";

@EventsHandler(DeliveryAssignedMappedEvent)
export class DeliveryAssignedEventHandler
  implements IEventHandler<DeliveryAssignedMappedEvent>
{
  private readonly logger = new Logger(DeliveryAssignedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: DeliveryAssignedMappedEvent): Promise<void> {
    this.logger.log(
      `Driver Assigned Policy triggered for order ${event.orderId}`,
    );

    try {
      // Execute AcceptOrderCommand which will update order status to "in_transit"
      await this.commandBus.execute(
        new AcceptOrderCommand(
          event.orderId,
          event.driverId,
          30, // Default estimated delivery time in minutes
        ),
      );

      this.logger.log(
        `Order ${event.orderId} accepted by driver ${event.driverId}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to accept order ${event.orderId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to accept order ${event.orderId}: ${JSON.stringify(error)}`,
        );
      }
      throw error;
    }
  }
}

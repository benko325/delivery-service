import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { OrderConfirmedByRestaurantEvent } from "../../../restaurants/core/events/order-confirmed-by-restaurant.event";
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status/update-order-status.command";

@EventsHandler(OrderConfirmedByRestaurantEvent)
export class OrderConfirmedByRestaurantMapper implements IEventHandler<OrderConfirmedByRestaurantEvent> {
  private readonly logger = new Logger(OrderConfirmedByRestaurantMapper.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OrderConfirmedByRestaurantEvent): Promise<void> {
    this.logger.log(
      `Handling OrderConfirmedByRestaurantEvent for order: ${event.orderId}, ` +
        `restaurant: ${event.restaurantId}, ` +
        `estimated preparation: ${event.estimatedPreparationMinutes} minutes`,
    );

    await this.commandBus.execute(
      new UpdateOrderStatusCommand(event.orderId, "confirmed"),
    );

    this.logger.log(`Order ${event.orderId} status updated to confirmed`);
  }
}

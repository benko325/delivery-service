import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { OrderRejectedByRestaurantEvent } from "../../../restaurants/core/events/order-rejected-by-restaurant.event";
import { CancelOrderCommand } from "../../application/commands/cancel-order/cancel-order.command";

@EventsHandler(OrderRejectedByRestaurantEvent)
export class OrderRejectedByRestaurantMapper implements IEventHandler<OrderRejectedByRestaurantEvent> {
  private readonly logger = new Logger(OrderRejectedByRestaurantMapper.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OrderRejectedByRestaurantEvent): Promise<void> {
    this.logger.log(
      `Handling OrderRejectedByRestaurantEvent for order: ${event.orderId}, ` +
        `restaurant: ${event.restaurantId}, ` +
        `reason: ${event.reason}`,
    );

    await this.commandBus.execute(
      new CancelOrderCommand(
        event.orderId,
        `Restaurant rejected: ${event.reason}`,
      ),
    );

    this.logger.log(
      `Order ${event.orderId} cancelled due to restaurant rejection`,
    );
  }
}

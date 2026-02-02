import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { OrderRejectedByRestaurantEvent } from "../../../restaurants/core/events/order-rejected-by-restaurant.event";
import { CancelOrderCommand } from "../../application/commands/cancel-order/cancel-order.command";

@EventsHandler(OrderRejectedByRestaurantEvent)
export class OrderRejectedByRestaurantMapper implements IEventHandler<OrderRejectedByRestaurantEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(OrderRejectedByRestaurantMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: OrderRejectedByRestaurantEvent): Promise<void> {
    this.logger.info(
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

    this.logger.info(
      `Order ${event.orderId} cancelled due to restaurant rejection`,
    );
  }
}

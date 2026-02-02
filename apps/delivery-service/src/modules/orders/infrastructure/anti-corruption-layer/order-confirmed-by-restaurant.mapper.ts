import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { OrderConfirmedByRestaurantEvent } from "../../../restaurants/core/events/order-confirmed-by-restaurant.event";
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status/update-order-status.command";

@EventsHandler(OrderConfirmedByRestaurantEvent)
export class OrderConfirmedByRestaurantMapper implements IEventHandler<OrderConfirmedByRestaurantEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(OrderConfirmedByRestaurantMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: OrderConfirmedByRestaurantEvent): Promise<void> {
    this.logger.info(
      `Handling OrderConfirmedByRestaurantEvent for order: ${event.orderId}, ` +
        `restaurant: ${event.restaurantId}, ` +
        `estimated preparation: ${event.estimatedPreparationMinutes} minutes`,
    );

    await this.commandBus.execute(
      new UpdateOrderStatusCommand(event.orderId, "confirmed"),
    );

    this.logger.info(`Order ${event.orderId} status updated to confirmed`);
  }
}

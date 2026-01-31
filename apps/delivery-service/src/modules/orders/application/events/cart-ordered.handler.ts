import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { CartOrderedMappedEvent } from "../../infrastructure/anti-corruption-layer/cart-ordered.mapper";
import { CreateOrderCommand } from "../commands/create-order/create-order.command";
import { MetricsService } from "../../../shared-kernel/infrastructure/metrics";

@EventsHandler(CartOrderedMappedEvent)
export class CartOrderedEventHandler implements IEventHandler<CartOrderedMappedEvent> {
  private readonly logger = new Logger(CartOrderedEventHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly metricsService: MetricsService,
  ) {}

  async handle(event: CartOrderedMappedEvent): Promise<void> {
    this.logger.log(
      `Place Order Policy triggered for customer ${event.customerId}`,
    );

    try {
      await this.commandBus.execute(
        new CreateOrderCommand(
          event.customerId,
          event.restaurantId,
          event.items,
          event.deliveryAddress,
          event.totalAmount,
          event.deliveryFee,
          event.currency,
        ),
      );

      this.logger.log(
        `Order created successfully for customer ${event.customerId}`,
      );

      // Record metrics
      this.metricsService.incrementOrdersCreated("pending");
    } catch (error) {
      this.logger.error(
        `Failed to create order for customer ${event.customerId}: ${error}`,
      );
      throw error;
    }
  }
}

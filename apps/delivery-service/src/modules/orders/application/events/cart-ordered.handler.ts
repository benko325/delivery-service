import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { CartOrderedMappedEvent } from "../../infrastructure/anti-corruption-layer/cart-ordered.mapper";
import { CreateOrderCommand } from "../commands/create-order/create-order.command";
import { MetricsService } from "../../../shared-kernel/infrastructure/metrics";

@EventsHandler(CartOrderedMappedEvent)
export class CartOrderedEventHandler implements IEventHandler<CartOrderedMappedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly metricsService: MetricsService,
    @InjectPinoLogger(CartOrderedEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: CartOrderedMappedEvent): Promise<void> {
    this.logger.info(
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

      this.logger.info(
        `Order created successfully for customer ${event.customerId}`,
      );

      // Record metrics
      this.metricsService.incrementOrdersCreated("pending");
      this.metricsService.incrementOrdersPerRestaurant(event.restaurantId);
      this.metricsService.recordOrderAmount(event.totalAmount, event.currency);
      this.metricsService.incrementRevenue(event.totalAmount, event.currency);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create order for customer ${event.customerId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to create order for customer ${event.customerId}: ${JSON.stringify(error)}`,
        );
      }
      throw error;
    }
  }
}

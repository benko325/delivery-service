import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { AddItemToCartCommand } from "./add-item-to-cart.command";
import { ICartAggregateRepository } from "../../../core/repositories/cart.repository.interface";
import { CartAggregate } from "../../../core/aggregates/cart.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics";

@CommandHandler(AddItemToCartCommand)
export class AddItemToCartCommandHandler implements ICommandHandler<AddItemToCartCommand> {
  constructor(
    @Inject("ICartAggregateRepository")
    private readonly cartAggregateRepository: ICartAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(
    command: AddItemToCartCommand,
  ): Promise<{ cartId: string; totalAmount: number }> {
    const cart = await this.cartAggregateRepository.findByCustomerId(
      command.customerId,
    );

    const cartAggregate = this.publisher.mergeObjectContext(
      new CartAggregate(),
    );
    const isNewCart = !cart;

    if (cart) {
      cartAggregate.loadState(cart);
    } else {
      cartAggregate.create(command.customerId);
    }

    cartAggregate.addItem(
      command.menuItemId,
      command.restaurantId,
      command.name,
      command.price,
      command.currency,
      command.quantity,
    );

    // Commit events first to ensure downstream services are notified before persistence
    cartAggregate.commit();

    if (isNewCart) {
      await this.cartAggregateRepository.save({
        id: cartAggregate.id,
        customerId: cartAggregate.customerId,
        restaurantId: cartAggregate.restaurantId,
        items: cartAggregate.items,
        totalAmount: cartAggregate.totalAmount,
        currency: cartAggregate.currency,
        createdAt: cartAggregate.createdAt,
        updatedAt: cartAggregate.updatedAt,
      });

      // Record cart created metric for new carts
      this.metricsService.incrementCartsCreated();
    } else {
      await this.cartAggregateRepository.update(cart.id, {
        restaurantId: cartAggregate.restaurantId,
        items: cartAggregate.items,
        totalAmount: cartAggregate.totalAmount,
        currency: cartAggregate.currency,
        updatedAt: cartAggregate.updatedAt,
      });
    }

    // Record item added metric
    this.metricsService.incrementCartItemsAdded(command.quantity);

    return {
      cartId: cartAggregate.id,
      totalAmount: cartAggregate.totalAmount,
    };
  }
}

import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { CheckoutCartCommand } from "./checkout-cart.command";
import { ICartAggregateRepository } from "../../../core/repositories/cart.repository.interface";
import { CartAggregate } from "../../../core/aggregates/cart.aggregate";

@CommandHandler(CheckoutCartCommand)
export class CheckoutCartCommandHandler implements ICommandHandler<CheckoutCartCommand> {
  constructor(
    @Inject("ICartAggregateRepository")
    private readonly cartAggregateRepository: ICartAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CheckoutCartCommand): Promise<{ message: string }> {
    const cart = await this.cartAggregateRepository.findByCustomerId(
      command.customerId,
    );

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    if (cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const cartAggregate = this.publisher.mergeObjectContext(
      new CartAggregate(),
    );
    cartAggregate.loadState(cart);

    cartAggregate.checkout(command.deliveryAddress, command.deliveryFee);

    // Commit events first to ensure order is created before cart is deleted
    // If event publishing fails, cart remains and user can retry
    cartAggregate.commit();

    await this.cartAggregateRepository.delete(cart.id);

    return { message: "Cart ordered successfully" };
  }
}

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

    await this.cartAggregateRepository.delete(cart.id);

    cartAggregate.commit();

    return { message: "Cart ordered successfully" };
  }
}

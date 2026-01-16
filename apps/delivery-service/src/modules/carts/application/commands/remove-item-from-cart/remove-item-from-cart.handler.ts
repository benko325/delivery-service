import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RemoveItemFromCartCommand } from './remove-item-from-cart.command';
import { ICartAggregateRepository } from '../../../core/repositories/cart.repository.interface';
import { CartAggregate } from '../../../core/aggregates/cart.aggregate';

@CommandHandler(RemoveItemFromCartCommand)
export class RemoveItemFromCartCommandHandler
    implements ICommandHandler<RemoveItemFromCartCommand>
{
    constructor(
        @Inject('ICartAggregateRepository')
        private readonly cartAggregateRepository: ICartAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: RemoveItemFromCartCommand): Promise<{ success: boolean }> {
        const cart = await this.cartAggregateRepository.findByCustomerId(command.customerId);

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const cartAggregate = this.publisher.mergeObjectContext(new CartAggregate());
        cartAggregate.loadState(cart);

        cartAggregate.removeItem(command.menuItemId);

        await this.cartAggregateRepository.update(cart.id, {
            restaurantId: cartAggregate.restaurantId,
            items: cartAggregate.items,
            totalAmount: cartAggregate.totalAmount,
            updatedAt: cartAggregate.updatedAt,
        });

        cartAggregate.commit();

        return { success: true };
    }
}

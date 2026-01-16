import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddItemToCartCommand } from './add-item-to-cart.command';
import { ICartAggregateRepository } from '../../../core/repositories/cart.repository.interface';
import { CartAggregate } from '../../../core/aggregates/cart.aggregate';

@CommandHandler(AddItemToCartCommand)
export class AddItemToCartCommandHandler implements ICommandHandler<AddItemToCartCommand> {
    constructor(
        @Inject('ICartAggregateRepository')
        private readonly cartAggregateRepository: ICartAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: AddItemToCartCommand): Promise<{ cartId: string; totalAmount: number }> {
        let cart = await this.cartAggregateRepository.findByCustomerId(command.customerId);

        const cartAggregate = this.publisher.mergeObjectContext(new CartAggregate());

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

        if (cart) {
            await this.cartAggregateRepository.update(cart.id, {
                restaurantId: cartAggregate.restaurantId,
                items: cartAggregate.items,
                totalAmount: cartAggregate.totalAmount,
                currency: cartAggregate.currency,
                updatedAt: cartAggregate.updatedAt,
            });
        } else {
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
        }

        cartAggregate.commit();

        return {
            cartId: cartAggregate.id,
            totalAmount: cartAggregate.totalAmount,
        };
    }
}

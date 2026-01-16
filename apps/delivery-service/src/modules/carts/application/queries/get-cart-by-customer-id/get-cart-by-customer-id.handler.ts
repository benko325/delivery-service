import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCartByCustomerIdQuery } from './get-cart-by-customer-id.query';
import { ICartRepository } from '../../../core/repositories/cart.repository.interface';
import { Cart } from '../../../core/entities/cart.entity';

@QueryHandler(GetCartByCustomerIdQuery)
export class GetCartByCustomerIdQueryHandler
    implements IQueryHandler<GetCartByCustomerIdQuery>
{
    constructor(
        @Inject('ICartRepository')
        private readonly cartRepository: ICartRepository,
    ) {}

    async execute(query: GetCartByCustomerIdQuery): Promise<Cart | { items: []; totalAmount: 0 }> {
        const cart = await this.cartRepository.findByCustomerId(query.customerId);

        if (!cart) {
            return { items: [], totalAmount: 0 };
        }

        return cart;
    }
}

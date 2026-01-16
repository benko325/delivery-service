import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { ICartRepository } from '../../../core/repositories/cart.repository.interface';
import { Cart } from '../../../core/entities/cart.entity';
import { CartDatabase } from '../../../core/types/cart-database.types';

@Injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<CartDatabase>,
    ) {}

    async findById(id: string): Promise<Cart | null> {
        const cart = await this.db
            .selectFrom('carts.carts')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return cart ? this.mapToCart(cart) : null;
    }

    async findByCustomerId(customerId: string): Promise<Cart | null> {
        const cart = await this.db
            .selectFrom('carts.carts')
            .selectAll()
            .where('customerId', '=', customerId)
            .executeTakeFirst();

        return cart ? this.mapToCart(cart) : null;
    }

    private mapToCart(row: unknown): Cart {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            customerId: data.customerId as string,
            restaurantId: data.restaurantId as string | null,
            items:
                typeof data.items === 'string' ? JSON.parse(data.items) : data.items || [],
            totalAmount: data.totalAmount as number,
            currency: data.currency as string,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

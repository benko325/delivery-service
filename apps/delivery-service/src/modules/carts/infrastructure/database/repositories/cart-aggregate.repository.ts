import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { ICartAggregateRepository } from '../../../core/repositories/cart.repository.interface';
import { Cart } from '../../../core/entities/cart.entity';
import { CartDatabase, CartItem } from '../../../core/types/cart-database.types';

@Injectable()
export class CartAggregateRepository implements ICartAggregateRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<CartDatabase>,
    ) {}

    async save(cart: {
        id: string;
        customerId: string;
        restaurantId: string | null;
        items: CartItem[];
        totalAmount: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<void> {
        await this.db
            .insertInto('carts.carts')
            .values({
                id: cart.id,
                customerId: cart.customerId,
                restaurantId: cart.restaurantId,
                items: sql`${JSON.stringify(cart.items)}::jsonb`,
                totalAmount: cart.totalAmount,
                currency: cart.currency,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt,
            } as never)
            .execute();
    }

    async update(
        id: string,
        data: Partial<{
            restaurantId: string | null;
            items: CartItem[];
            totalAmount: number;
            currency: string;
            updatedAt: Date;
        }>,
    ): Promise<void> {
        const updateData: Record<string, unknown> = {};

        if (data.restaurantId !== undefined) updateData.restaurantId = data.restaurantId;
        if (data.items !== undefined) {
            updateData.items = sql`${JSON.stringify(data.items)}::jsonb`;
        }
        if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
        if (data.currency !== undefined) updateData.currency = data.currency;
        if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

        await this.db
            .updateTable('carts.carts')
            .set(updateData as never)
            .where('id', '=', id)
            .execute();
    }

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

    async delete(id: string): Promise<void> {
        await this.db.deleteFrom('carts.carts').where('id', '=', id).execute();
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

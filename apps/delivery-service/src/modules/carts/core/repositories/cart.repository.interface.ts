import { Cart } from '../entities/cart.entity';
import { CartItem } from '../types/cart-database.types';

export interface ICartRepository {
    findById(id: string): Promise<Cart | null>;
    findByCustomerId(customerId: string): Promise<Cart | null>;
}

export interface ICartAggregateRepository {
    save(cart: {
        id: string;
        customerId: string;
        restaurantId: string | null;
        items: CartItem[];
        totalAmount: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<void>;
    update(
        id: string,
        data: Partial<{
            restaurantId: string | null;
            items: CartItem[];
            totalAmount: number;
            currency: string;
            updatedAt: Date;
        }>,
    ): Promise<void>;
    findById(id: string): Promise<Cart | null>;
    findByCustomerId(customerId: string): Promise<Cart | null>;
    delete(id: string): Promise<void>;
}

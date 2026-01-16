import { CartItem } from '../types/cart-database.types';

export interface Cart {
    id: string;
    customerId: string;
    restaurantId: string | null;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

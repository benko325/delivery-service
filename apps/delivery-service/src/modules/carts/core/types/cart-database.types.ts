import { Generated } from 'kysely';

export interface CartItem {
    menuItemId: string;
    restaurantId: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
}

export interface CartsTable {
    id: Generated<string>;
    customerId: string;
    restaurantId: string | null;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export interface CartDatabase {
    'carts.carts': CartsTable;
}

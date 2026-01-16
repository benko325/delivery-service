import { Generated } from 'kysely';

export interface RestaurantAddress {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

export type MenuItemCategory = 'appetizer' | 'main_course' | 'dessert' | 'beverage' | 'side';

export interface RestaurantsTable {
    id: Generated<string>;
    ownerId: string;
    name: string;
    description: string;
    address: RestaurantAddress;
    phone: string;
    email: string;
    isActive: boolean;
    openingHours: Record<string, { open: string; close: string }>;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export interface MenuItemsTable {
    id: Generated<string>;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: MenuItemCategory;
    imageUrl: string | null;
    isAvailable: boolean;
    preparationTime: number; // in minutes
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export interface RestaurantDatabase {
    'restaurants.restaurants': RestaurantsTable;
    'restaurants.menu_items': MenuItemsTable;
}

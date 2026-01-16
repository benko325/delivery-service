import { MenuItemCategory } from '../types/restaurant-database.types';

export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: MenuItemCategory;
    imageUrl: string | null;
    isAvailable: boolean;
    preparationTime: number;
    createdAt: Date;
    updatedAt: Date;
}

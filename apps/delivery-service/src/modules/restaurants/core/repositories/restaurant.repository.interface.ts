import { Restaurant } from '../entities/restaurant.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { RestaurantAddress, MenuItemCategory } from '../types/restaurant-database.types';

export interface IRestaurantRepository {
    findById(id: string): Promise<Restaurant | null>;
    findByOwnerId(ownerId: string): Promise<Restaurant | null>;
    findAll(): Promise<Restaurant[]>;
    findAllActive(): Promise<Restaurant[]>;
}

export interface IRestaurantAggregateRepository {
    save(restaurant: {
        id: string;
        ownerId: string;
        name: string;
        description: string;
        address: RestaurantAddress;
        phone: string;
        email: string;
        isActive: boolean;
        openingHours: Record<string, { open: string; close: string }>;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<void>;
    update(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            address: RestaurantAddress;
            phone: string;
            email: string;
            isActive: boolean;
            openingHours: Record<string, { open: string; close: string }>;
            updatedAt: Date;
        }>,
    ): Promise<void>;
    findById(id: string): Promise<Restaurant | null>;
}

export interface IMenuItemRepository {
    findById(id: string): Promise<MenuItem | null>;
    findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
    findAvailableByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
    save(item: {
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
    }): Promise<void>;
    update(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            price: number;
            currency: string;
            category: MenuItemCategory;
            imageUrl: string | null;
            isAvailable: boolean;
            preparationTime: number;
            updatedAt: Date;
        }>,
    ): Promise<void>;
    delete(id: string): Promise<void>;
}

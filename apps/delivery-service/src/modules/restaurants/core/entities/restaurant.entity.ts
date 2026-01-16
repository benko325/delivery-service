import { RestaurantAddress } from '../types/restaurant-database.types';

export interface Restaurant {
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
}

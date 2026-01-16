import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { IRestaurantRepository } from '../../../core/repositories/restaurant.repository.interface';
import { Restaurant } from '../../../core/entities/restaurant.entity';
import { RestaurantDatabase } from '../../../core/types/restaurant-database.types';

@Injectable()
export class RestaurantRepository implements IRestaurantRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<RestaurantDatabase>,
    ) {}

    async findById(id: string): Promise<Restaurant | null> {
        const restaurant = await this.db
            .selectFrom('restaurants.restaurants')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return restaurant ? this.mapToRestaurant(restaurant) : null;
    }

    async findByOwnerId(ownerId: string): Promise<Restaurant | null> {
        const restaurant = await this.db
            .selectFrom('restaurants.restaurants')
            .selectAll()
            .where('ownerId', '=', ownerId)
            .executeTakeFirst();

        return restaurant ? this.mapToRestaurant(restaurant) : null;
    }

    async findAll(): Promise<Restaurant[]> {
        const restaurants = await this.db
            .selectFrom('restaurants.restaurants')
            .selectAll()
            .orderBy('name', 'asc')
            .execute();

        return restaurants.map((r) => this.mapToRestaurant(r));
    }

    async findAllActive(): Promise<Restaurant[]> {
        const restaurants = await this.db
            .selectFrom('restaurants.restaurants')
            .selectAll()
            .where('isActive', '=', true)
            .orderBy('name', 'asc')
            .execute();

        return restaurants.map((r) => this.mapToRestaurant(r));
    }

    private mapToRestaurant(row: unknown): Restaurant {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            ownerId: data.ownerId as string,
            name: data.name as string,
            description: data.description as string,
            address:
                typeof data.address === 'string' ? JSON.parse(data.address) : data.address,
            phone: data.phone as string,
            email: data.email as string,
            isActive: data.isActive as boolean,
            openingHours:
                typeof data.openingHours === 'string'
                    ? JSON.parse(data.openingHours)
                    : data.openingHours,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

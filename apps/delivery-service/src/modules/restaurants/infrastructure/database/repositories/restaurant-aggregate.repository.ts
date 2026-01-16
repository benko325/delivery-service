import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { IRestaurantAggregateRepository } from '../../../core/repositories/restaurant.repository.interface';
import { Restaurant } from '../../../core/entities/restaurant.entity';
import { RestaurantDatabase, RestaurantAddress } from '../../../core/types/restaurant-database.types';

@Injectable()
export class RestaurantAggregateRepository implements IRestaurantAggregateRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<RestaurantDatabase>,
    ) {}

    async save(restaurant: {
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
    }): Promise<void> {
        await this.db
            .insertInto('restaurants.restaurants')
            .values({
                id: restaurant.id,
                ownerId: restaurant.ownerId,
                name: restaurant.name,
                description: restaurant.description,
                address: sql`${JSON.stringify(restaurant.address)}::jsonb`,
                phone: restaurant.phone,
                email: restaurant.email.toLowerCase(),
                isActive: restaurant.isActive,
                openingHours: sql`${JSON.stringify(restaurant.openingHours)}::jsonb`,
                createdAt: restaurant.createdAt,
                updatedAt: restaurant.updatedAt,
            } as never)
            .execute();
    }

    async update(
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
    ): Promise<void> {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.address !== undefined) {
            updateData.address = sql`${JSON.stringify(data.address)}::jsonb`;
        }
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.email !== undefined) updateData.email = data.email.toLowerCase();
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.openingHours !== undefined) {
            updateData.openingHours = sql`${JSON.stringify(data.openingHours)}::jsonb`;
        }
        if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

        await this.db
            .updateTable('restaurants.restaurants')
            .set(updateData as never)
            .where('id', '=', id)
            .execute();
    }

    async findById(id: string): Promise<Restaurant | null> {
        const restaurant = await this.db
            .selectFrom('restaurants.restaurants')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return restaurant ? this.mapToRestaurant(restaurant) : null;
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

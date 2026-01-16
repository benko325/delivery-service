import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { IMenuItemRepository } from '../../../core/repositories/restaurant.repository.interface';
import { MenuItem } from '../../../core/entities/menu-item.entity';
import { RestaurantDatabase, MenuItemCategory } from '../../../core/types/restaurant-database.types';

@Injectable()
export class MenuItemRepository implements IMenuItemRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<RestaurantDatabase>,
    ) {}

    async findById(id: string): Promise<MenuItem | null> {
        const item = await this.db
            .selectFrom('restaurants.menu_items')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return item ? this.mapToMenuItem(item) : null;
    }

    async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
        const items = await this.db
            .selectFrom('restaurants.menu_items')
            .selectAll()
            .where('restaurantId', '=', restaurantId)
            .orderBy('category', 'asc')
            .orderBy('name', 'asc')
            .execute();

        return items.map((item) => this.mapToMenuItem(item));
    }

    async findAvailableByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
        const items = await this.db
            .selectFrom('restaurants.menu_items')
            .selectAll()
            .where('restaurantId', '=', restaurantId)
            .where('isAvailable', '=', true)
            .orderBy('category', 'asc')
            .orderBy('name', 'asc')
            .execute();

        return items.map((item) => this.mapToMenuItem(item));
    }

    async save(item: {
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
    }): Promise<void> {
        await this.db
            .insertInto('restaurants.menu_items')
            .values({
                id: item.id,
                restaurantId: item.restaurantId,
                name: item.name,
                description: item.description,
                price: item.price,
                currency: item.currency,
                category: item.category,
                imageUrl: item.imageUrl,
                isAvailable: item.isAvailable,
                preparationTime: item.preparationTime,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            } as never)
            .execute();
    }

    async update(
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
    ): Promise<void> {
        await this.db
            .updateTable('restaurants.menu_items')
            .set(data as never)
            .where('id', '=', id)
            .execute();
    }

    async delete(id: string): Promise<void> {
        await this.db
            .deleteFrom('restaurants.menu_items')
            .where('id', '=', id)
            .execute();
    }

    private mapToMenuItem(row: unknown): MenuItem {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            restaurantId: data.restaurantId as string,
            name: data.name as string,
            description: data.description as string,
            price: data.price as number,
            currency: data.currency as string,
            category: data.category as MenuItemCategory,
            imageUrl: data.imageUrl as string | null,
            isAvailable: data.isAvailable as boolean,
            preparationTime: data.preparationTime as number,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

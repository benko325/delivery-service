import { IEvent } from '@nestjs/cqrs';
import { MenuItemCategory } from '../types/restaurant-database.types';

export class MenuItemCreatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly restaurantId: string,
        public readonly name: string,
        public readonly price: number,
        public readonly category: MenuItemCategory,
        public readonly createdAt: Date,
    ) {}
}

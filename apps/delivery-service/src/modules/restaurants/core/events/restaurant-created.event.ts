import { IEvent } from '@nestjs/cqrs';
import { RestaurantAddress } from '../types/restaurant-database.types';

export class RestaurantCreatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly ownerId: string,
        public readonly name: string,
        public readonly address: RestaurantAddress,
        public readonly createdAt: Date,
    ) {}
}

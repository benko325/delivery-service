import { ICommand } from '@nestjs/cqrs';
import { RestaurantAddress } from '../../../core/types/restaurant-database.types';

export class CreateRestaurantCommand implements ICommand {
    constructor(
        public readonly ownerId: string,
        public readonly name: string,
        public readonly description: string,
        public readonly address: RestaurantAddress,
        public readonly phone: string,
        public readonly email: string,
        public readonly openingHours: Record<string, { open: string; close: string }>,
    ) {}
}

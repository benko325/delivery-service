import { ICommand } from '@nestjs/cqrs';
import { MenuItemCategory } from '../../../core/types/restaurant-database.types';

export class CreateMenuItemCommand implements ICommand {
    constructor(
        public readonly restaurantId: string,
        public readonly name: string,
        public readonly description: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly category: MenuItemCategory,
        public readonly imageUrl: string | null,
        public readonly preparationTime: number,
    ) {}
}

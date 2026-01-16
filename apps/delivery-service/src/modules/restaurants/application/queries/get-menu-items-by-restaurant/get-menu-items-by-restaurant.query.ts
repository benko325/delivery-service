import { IQuery } from '@nestjs/cqrs';

export class GetMenuItemsByRestaurantQuery implements IQuery {
    constructor(
        public readonly restaurantId: string,
        public readonly availableOnly: boolean = true,
    ) {}
}

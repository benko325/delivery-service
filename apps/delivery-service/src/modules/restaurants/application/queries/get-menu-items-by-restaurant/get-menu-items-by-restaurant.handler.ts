import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMenuItemsByRestaurantQuery } from './get-menu-items-by-restaurant.query';
import { IMenuItemRepository } from '../../../core/repositories/restaurant.repository.interface';
import { MenuItem } from '../../../core/entities/menu-item.entity';

@QueryHandler(GetMenuItemsByRestaurantQuery)
export class GetMenuItemsByRestaurantQueryHandler
    implements IQueryHandler<GetMenuItemsByRestaurantQuery>
{
    constructor(
        @Inject('IMenuItemRepository')
        private readonly menuItemRepository: IMenuItemRepository,
    ) {}

    async execute(query: GetMenuItemsByRestaurantQuery): Promise<MenuItem[]> {
        if (query.availableOnly) {
            return this.menuItemRepository.findAvailableByRestaurantId(query.restaurantId);
        }
        return this.menuItemRepository.findByRestaurantId(query.restaurantId);
    }
}

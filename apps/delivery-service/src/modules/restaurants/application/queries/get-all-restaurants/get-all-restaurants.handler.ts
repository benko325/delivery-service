import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllRestaurantsQuery } from './get-all-restaurants.query';
import { IRestaurantRepository } from '../../../core/repositories/restaurant.repository.interface';
import { Restaurant } from '../../../core/entities/restaurant.entity';

@QueryHandler(GetAllRestaurantsQuery)
export class GetAllRestaurantsQueryHandler implements IQueryHandler<GetAllRestaurantsQuery> {
    constructor(
        @Inject('IRestaurantRepository')
        private readonly restaurantRepository: IRestaurantRepository,
    ) {}

    async execute(query: GetAllRestaurantsQuery): Promise<Restaurant[]> {
        if (query.activeOnly) {
            return this.restaurantRepository.findAllActive();
        }
        return this.restaurantRepository.findAll();
    }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRestaurantByIdQuery } from './get-restaurant-by-id.query';
import { IRestaurantRepository } from '../../../core/repositories/restaurant.repository.interface';
import { Restaurant } from '../../../core/entities/restaurant.entity';

@QueryHandler(GetRestaurantByIdQuery)
export class GetRestaurantByIdQueryHandler implements IQueryHandler<GetRestaurantByIdQuery> {
    constructor(
        @Inject('IRestaurantRepository')
        private readonly restaurantRepository: IRestaurantRepository,
    ) {}

    async execute(query: GetRestaurantByIdQuery): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findById(query.id);

        if (!restaurant) {
            throw new NotFoundException(`Restaurant with ID ${query.id} not found`);
        }

        return restaurant;
    }
}

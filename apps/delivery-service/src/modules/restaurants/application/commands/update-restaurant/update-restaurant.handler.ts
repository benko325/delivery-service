import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateRestaurantCommand } from './update-restaurant.command';
import { IRestaurantAggregateRepository } from '../../../core/repositories/restaurant.repository.interface';
import { RestaurantAggregate } from '../../../core/aggregates/restaurant.aggregate';

@CommandHandler(UpdateRestaurantCommand)
export class UpdateRestaurantCommandHandler implements ICommandHandler<UpdateRestaurantCommand> {
    constructor(
        @Inject('IRestaurantAggregateRepository')
        private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateRestaurantCommand): Promise<{ success: boolean }> {
        const existingRestaurant = await this.restaurantAggregateRepository.findById(command.id);

        if (!existingRestaurant) {
            throw new NotFoundException(`Restaurant with ID ${command.id} not found`);
        }

        const restaurantAggregate = this.publisher.mergeObjectContext(new RestaurantAggregate());
        restaurantAggregate.loadState(existingRestaurant);

        restaurantAggregate.update(
            command.name,
            command.description,
            command.address,
            command.phone,
            command.email,
            command.openingHours,
        );

        await this.restaurantAggregateRepository.update(command.id, {
            name: restaurantAggregate.name,
            description: restaurantAggregate.description,
            address: restaurantAggregate.address,
            phone: restaurantAggregate.phone,
            email: restaurantAggregate.email,
            openingHours: restaurantAggregate.openingHours,
            updatedAt: restaurantAggregate.updatedAt,
        });

        restaurantAggregate.commit();

        return { success: true };
    }
}

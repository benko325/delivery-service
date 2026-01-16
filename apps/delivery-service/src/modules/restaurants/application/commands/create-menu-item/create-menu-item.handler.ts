import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreateMenuItemCommand } from './create-menu-item.command';
import { IMenuItemRepository, IRestaurantRepository } from '../../../core/repositories/restaurant.repository.interface';
import { MenuItemAggregate } from '../../../core/aggregates/menu-item.aggregate';

@CommandHandler(CreateMenuItemCommand)
export class CreateMenuItemCommandHandler implements ICommandHandler<CreateMenuItemCommand> {
    constructor(
        @Inject('IMenuItemRepository')
        private readonly menuItemRepository: IMenuItemRepository,
        @Inject('IRestaurantRepository')
        private readonly restaurantRepository: IRestaurantRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: CreateMenuItemCommand): Promise<{ id: string }> {
        const restaurant = await this.restaurantRepository.findById(command.restaurantId);

        if (!restaurant) {
            throw new NotFoundException(`Restaurant with ID ${command.restaurantId} not found`);
        }

        const menuItemAggregate = this.publisher.mergeObjectContext(new MenuItemAggregate());

        menuItemAggregate.create(
            command.restaurantId,
            command.name,
            command.description,
            command.price,
            command.currency,
            command.category,
            command.imageUrl,
            command.preparationTime,
        );

        await this.menuItemRepository.save({
            id: menuItemAggregate.id,
            restaurantId: menuItemAggregate.restaurantId,
            name: menuItemAggregate.name,
            description: menuItemAggregate.description,
            price: menuItemAggregate.price,
            currency: menuItemAggregate.currency,
            category: menuItemAggregate.category,
            imageUrl: menuItemAggregate.imageUrl,
            isAvailable: menuItemAggregate.isAvailable,
            preparationTime: menuItemAggregate.preparationTime,
            createdAt: menuItemAggregate.createdAt,
            updatedAt: menuItemAggregate.updatedAt,
        });

        menuItemAggregate.commit();

        return { id: menuItemAggregate.id };
    }
}

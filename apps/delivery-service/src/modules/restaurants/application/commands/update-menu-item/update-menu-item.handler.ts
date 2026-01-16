import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateMenuItemCommand } from './update-menu-item.command';
import { IMenuItemRepository } from '../../../core/repositories/restaurant.repository.interface';
import { MenuItemAggregate } from '../../../core/aggregates/menu-item.aggregate';

@CommandHandler(UpdateMenuItemCommand)
export class UpdateMenuItemCommandHandler implements ICommandHandler<UpdateMenuItemCommand> {
    constructor(
        @Inject('IMenuItemRepository')
        private readonly menuItemRepository: IMenuItemRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateMenuItemCommand): Promise<{ success: boolean }> {
        const existingMenuItem = await this.menuItemRepository.findById(command.id);

        if (!existingMenuItem) {
            throw new NotFoundException(`Menu item with ID ${command.id} not found`);
        }

        const menuItemAggregate = this.publisher.mergeObjectContext(new MenuItemAggregate());
        menuItemAggregate.loadState(existingMenuItem);

        menuItemAggregate.update(
            command.name,
            command.description,
            command.price,
            command.currency,
            command.category,
            command.imageUrl,
            command.preparationTime,
            command.isAvailable,
        );

        await this.menuItemRepository.update(command.id, {
            name: menuItemAggregate.name,
            description: menuItemAggregate.description,
            price: menuItemAggregate.price,
            currency: menuItemAggregate.currency,
            category: menuItemAggregate.category,
            imageUrl: menuItemAggregate.imageUrl,
            preparationTime: menuItemAggregate.preparationTime,
            isAvailable: menuItemAggregate.isAvailable,
            updatedAt: menuItemAggregate.updatedAt,
        });

        menuItemAggregate.commit();

        return { success: true };
    }
}

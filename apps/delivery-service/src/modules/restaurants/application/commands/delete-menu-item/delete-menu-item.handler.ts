import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteMenuItemCommand } from './delete-menu-item.command';
import { IMenuItemRepository } from '../../../core/repositories/restaurant.repository.interface';

@CommandHandler(DeleteMenuItemCommand)
export class DeleteMenuItemCommandHandler implements ICommandHandler<DeleteMenuItemCommand> {
    constructor(
        @Inject('IMenuItemRepository')
        private readonly menuItemRepository: IMenuItemRepository,
    ) {}

    async execute(command: DeleteMenuItemCommand): Promise<void> {
        const existingMenuItem = await this.menuItemRepository.findById(command.id);

        if (!existingMenuItem) {
            throw new NotFoundException(`Menu item with ID ${command.id} not found`);
        }

        await this.menuItemRepository.delete(command.id);
    }
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DeleteMenuItemCommand } from "./delete-menu-item.command";
import {
  IMenuItemRepository,
  IRestaurantRepository,
} from "../../../core/repositories/restaurant.repository.interface";

@CommandHandler(DeleteMenuItemCommand)
export class DeleteMenuItemCommandHandler implements ICommandHandler<DeleteMenuItemCommand> {
  constructor(
    @Inject("IMenuItemRepository")
    private readonly menuItemRepository: IMenuItemRepository,
    @Inject("IRestaurantRepository")
    private readonly restaurantRepository: IRestaurantRepository,
  ) {}

  async execute(command: DeleteMenuItemCommand): Promise<void> {
    const existingMenuItem = await this.menuItemRepository.findById(command.id);

    if (!existingMenuItem) {
      throw new NotFoundException(`Menu item with ID ${command.id} not found`);
    }

    // Get the restaurant to check ownership
    const restaurant = await this.restaurantRepository.findById(
      existingMenuItem.restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${existingMenuItem.restaurantId} not found`,
      );
    }

    // Check ownership: admins can delete any menu item, owners only for their own restaurant
    const isAdmin = command.userRoles.includes("admin");
    const isOwner = restaurant.ownerId === command.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to delete menu items for this restaurant",
      );
    }

    await this.menuItemRepository.delete(command.id);
  }
}

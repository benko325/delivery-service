import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { UpdateMenuItemCommand } from "./update-menu-item.command";
import {
  IMenuItemRepository,
  IRestaurantRepository,
} from "../../../core/repositories/restaurant.repository.interface";
import { MenuItemAggregate } from "../../../core/aggregates/menu-item.aggregate";

@CommandHandler(UpdateMenuItemCommand)
export class UpdateMenuItemCommandHandler implements ICommandHandler<UpdateMenuItemCommand> {
  constructor(
    @Inject("IMenuItemRepository")
    private readonly menuItemRepository: IMenuItemRepository,
    @Inject("IRestaurantRepository")
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateMenuItemCommand): Promise<{ success: boolean }> {
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

    // Check ownership: admins can update any menu item, owners only for their own restaurant
    const isAdmin = command.userRoles.includes("admin");
    const isOwner = restaurant.ownerId === command.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to update menu items for this restaurant",
      );
    }

    const menuItemAggregate = this.publisher.mergeObjectContext(
      new MenuItemAggregate(),
    );
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

    // Commit events first to ensure downstream services are notified before persistence
    menuItemAggregate.commit();

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

    return { success: true };
  }
}

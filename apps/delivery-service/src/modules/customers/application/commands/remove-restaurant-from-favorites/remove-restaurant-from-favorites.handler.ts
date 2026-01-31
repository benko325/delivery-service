import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { RemoveRestaurantFromFavoritesCommand } from "./remove-restaurant-from-favorites.command";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { CustomerAggregate } from "../../../core/aggregates/customer.aggregate";

@CommandHandler(RemoveRestaurantFromFavoritesCommand)
export class RemoveRestaurantFromFavoritesCommandHandler implements ICommandHandler<RemoveRestaurantFromFavoritesCommand> {
  constructor(
    @Inject("ICustomerAggregateRepository")
    private readonly customerAggregateRepository: ICustomerAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: RemoveRestaurantFromFavoritesCommand,
  ): Promise<{ success: boolean }> {
    const existingCustomer = await this.customerAggregateRepository.findById(
      command.customerId,
    );
    if (!existingCustomer) {
      throw new NotFoundException(
        `Customer with ID ${command.customerId} not found`,
      );
    }

    const aggregate = this.publisher.mergeObjectContext(
      new CustomerAggregate(),
    );
    aggregate.loadState(existingCustomer);

    aggregate.removeFavoriteRestaurant(command.restaurantId);

    await this.customerAggregateRepository.update(command.customerId, {
      favoriteRestaurantIds: aggregate.favoriteRestaurantIds,
      updatedAt: aggregate.updatedAt,
    });

    aggregate.commit();
    return { success: true };
  }
}

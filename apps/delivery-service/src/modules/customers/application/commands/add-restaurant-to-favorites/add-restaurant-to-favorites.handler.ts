import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { AddRestaurantToFavoritesCommand } from "./add-restaurant-to-favorites.command";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { CustomerAggregate } from "../../../core/aggregates/customer.aggregate";

@CommandHandler(AddRestaurantToFavoritesCommand)
export class AddRestaurantToFavoritesCommandHandler implements ICommandHandler<AddRestaurantToFavoritesCommand> {
  constructor(
    @Inject("ICustomerAggregateRepository")
    private readonly customerAggregateRepository: ICustomerAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: AddRestaurantToFavoritesCommand,
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

    aggregate.addFavoriteRestaurant(command.restaurantId);

    await this.customerAggregateRepository.update(command.customerId, {
      favoriteRestaurantIds: aggregate.favoriteRestaurantIds,
      updatedAt: aggregate.updatedAt,
    });

    aggregate.commit();
    return { success: true };
  }
}

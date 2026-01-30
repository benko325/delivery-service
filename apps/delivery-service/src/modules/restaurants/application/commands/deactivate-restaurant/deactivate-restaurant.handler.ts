import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { DeactivateRestaurantCommand } from "./deactivate-restaurant.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";

@CommandHandler(DeactivateRestaurantCommand)
export class DeactivateRestaurantCommandHandler implements ICommandHandler<DeactivateRestaurantCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: DeactivateRestaurantCommand,
  ): Promise<{ success: boolean }> {
    const existingRestaurant =
      await this.restaurantAggregateRepository.findById(command.restaurantId);

    if (!existingRestaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${command.restaurantId} not found`,
      );
    }

    const restaurantAggregate = this.publisher.mergeObjectContext(
      new RestaurantAggregate(),
    );
    restaurantAggregate.loadState(existingRestaurant);

    restaurantAggregate.deactivate();

    await this.restaurantAggregateRepository.update(command.restaurantId, {
      isActive: restaurantAggregate.isActive,
      updatedAt: restaurantAggregate.updatedAt,
    });

    restaurantAggregate.commit();

    return { success: true };
  }
}

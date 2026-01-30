import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { ActivateRestaurantCommand } from "./activate-restaurant.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";

@CommandHandler(ActivateRestaurantCommand)
export class ActivateRestaurantCommandHandler implements ICommandHandler<ActivateRestaurantCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: ActivateRestaurantCommand,
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

    restaurantAggregate.activate();

    await this.restaurantAggregateRepository.update(command.restaurantId, {
      isActive: restaurantAggregate.isActive,
      updatedAt: restaurantAggregate.updatedAt,
    });

    restaurantAggregate.commit();

    return { success: true };
  }
}

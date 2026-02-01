import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DeactivateRestaurantCommand } from "./deactivate-restaurant.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics/metrics.service";

@CommandHandler(DeactivateRestaurantCommand)
export class DeactivateRestaurantCommandHandler implements ICommandHandler<DeactivateRestaurantCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
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

    // Check ownership: admins can deactivate any restaurant, owners can only deactivate their own
    const isAdmin = command.userRoles.includes("admin");
    const isOwner = existingRestaurant.ownerId === command.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to deactivate this restaurant",
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

    this.metricsService.incrementRestaurantsDeactivated();

    return { success: true };
  }
}

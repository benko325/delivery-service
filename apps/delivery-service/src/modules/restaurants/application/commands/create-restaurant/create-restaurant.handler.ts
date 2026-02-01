import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateRestaurantCommand } from "./create-restaurant.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics";

@CommandHandler(CreateRestaurantCommand)
export class CreateRestaurantCommandHandler implements ICommandHandler<CreateRestaurantCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(command: CreateRestaurantCommand): Promise<{ id: string }> {
    const restaurantAggregate = this.publisher.mergeObjectContext(
      new RestaurantAggregate(),
    );

    restaurantAggregate.create(
      command.ownerId,
      command.name,
      command.description,
      command.address,
      command.phone,
      command.email,
      command.openingHours,
    );

    await this.restaurantAggregateRepository.save({
      id: restaurantAggregate.id,
      ownerId: restaurantAggregate.ownerId,
      name: restaurantAggregate.name,
      description: restaurantAggregate.description,
      address: restaurantAggregate.address,
      phone: restaurantAggregate.phone,
      email: restaurantAggregate.email,
      isActive: restaurantAggregate.isActive,
      openingHours: restaurantAggregate.openingHours,
      createdAt: restaurantAggregate.createdAt,
      updatedAt: restaurantAggregate.updatedAt,
    });

    restaurantAggregate.commit();

    // Record metrics
    this.metricsService.incrementRestaurantsRegistered();

    return { id: restaurantAggregate.id };
  }
}

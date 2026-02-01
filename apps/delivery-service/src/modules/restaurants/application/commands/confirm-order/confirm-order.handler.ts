import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ConfirmOrderCommand } from "./confirm-order.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics/metrics.service";

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderCommandHandler implements ICommandHandler<ConfirmOrderCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<{ success: boolean }> {
    const existingRestaurant =
      await this.restaurantAggregateRepository.findById(command.restaurantId);

    if (!existingRestaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${command.restaurantId} not found`,
      );
    }

    // Check ownership: admins can confirm any restaurant's orders, owners can only confirm their own
    const isAdmin = command.userRoles.includes("admin");
    const isOwner = existingRestaurant.ownerId === command.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to confirm orders for this restaurant",
      );
    }

    const restaurantAggregate = this.publisher.mergeObjectContext(
      new RestaurantAggregate(),
    );
    restaurantAggregate.loadState(existingRestaurant);

    // Domain logic and event emission through aggregate
    restaurantAggregate.confirmOrder(
      command.orderId,
      command.estimatedPreparationMinutes,
    );

    // Commit events (publishes to RabbitMQ)
    restaurantAggregate.commit();

    this.metricsService.incrementOrdersConfirmedByRestaurant(
      command.restaurantId,
    );

    return { success: true };
  }
}

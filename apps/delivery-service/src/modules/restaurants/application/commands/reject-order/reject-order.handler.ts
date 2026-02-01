import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { RejectOrderCommand } from "./reject-order.command";
import { IRestaurantAggregateRepository } from "../../../core/repositories/restaurant.repository.interface";
import { RestaurantAggregate } from "../../../core/aggregates/restaurant.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics/metrics.service";

@CommandHandler(RejectOrderCommand)
export class RejectOrderCommandHandler implements ICommandHandler<RejectOrderCommand> {
  constructor(
    @Inject("IRestaurantAggregateRepository")
    private readonly restaurantAggregateRepository: IRestaurantAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(command: RejectOrderCommand): Promise<{ success: boolean }> {
    const existingRestaurant =
      await this.restaurantAggregateRepository.findById(command.restaurantId);

    if (!existingRestaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${command.restaurantId} not found`,
      );
    }

    // Check ownership: admins can reject any restaurant's orders, owners can only reject their own
    const isAdmin = command.userRoles.includes("admin");
    const isOwner = existingRestaurant.ownerId === command.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to reject orders for this restaurant",
      );
    }

    const restaurantAggregate = this.publisher.mergeObjectContext(
      new RestaurantAggregate(),
    );
    restaurantAggregate.loadState(existingRestaurant);

    // Domain logic and event emission through aggregate
    restaurantAggregate.rejectOrder(command.orderId, command.reason);

    // Commit events (publishes to RabbitMQ)
    restaurantAggregate.commit();

    this.metricsService.incrementOrdersRejectedByRestaurant(
      command.restaurantId,
    );

    return { success: true };
  }
}

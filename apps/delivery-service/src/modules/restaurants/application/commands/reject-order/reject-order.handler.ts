import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { RejectOrderCommand } from "./reject-order.command";
import { IRestaurantRepository } from "../../../core/repositories/restaurant.repository.interface";
import { OrderRejectedByRestaurantEvent } from "../../../core/events/order-rejected-by-restaurant.event";

@CommandHandler(RejectOrderCommand)
export class RejectOrderCommandHandler implements ICommandHandler<RejectOrderCommand> {
  constructor(
    @Inject("IRestaurantRepository")
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RejectOrderCommand): Promise<{ success: boolean }> {
    const restaurant = await this.restaurantRepository.findById(
      command.restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${command.restaurantId} not found`,
      );
    }

    const event = new OrderRejectedByRestaurantEvent({
      orderId: command.orderId,
      restaurantId: command.restaurantId,
      reason: command.reason,
      rejectedAt: new Date(),
    });

    this.eventBus.publish(event);

    return { success: true };
  }
}

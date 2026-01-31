import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { ConfirmOrderCommand } from "./confirm-order.command";
import { IRestaurantRepository } from "../../../core/repositories/restaurant.repository.interface";
import { OrderConfirmedByRestaurantEvent } from "../../../core/events/order-confirmed-by-restaurant.event";

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderCommandHandler implements ICommandHandler<ConfirmOrderCommand> {
  constructor(
    @Inject("IRestaurantRepository")
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<{ success: boolean }> {
    const restaurant = await this.restaurantRepository.findById(
      command.restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${command.restaurantId} not found`,
      );
    }

    if (!restaurant.isActive) {
      throw new BadRequestException("Restaurant is not active");
    }

    const event = new OrderConfirmedByRestaurantEvent({
      orderId: command.orderId,
      restaurantId: command.restaurantId,
      estimatedPreparationMinutes: command.estimatedPreparationMinutes,
      confirmedAt: new Date(),
    });

    this.eventBus.publish(event);

    return { success: true };
  }
}

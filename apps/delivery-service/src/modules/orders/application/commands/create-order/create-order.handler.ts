import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateOrderCommand } from "./create-order.command";
import { IOrderAggregateRepository } from "../../../core/repositories/order.repository.interface";
import { OrderAggregate } from "../../../core/aggregates/order.aggregate";

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject("IOrderAggregateRepository")
    private readonly orderAggregateRepository: IOrderAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: CreateOrderCommand,
  ): Promise<{ id: string; totalAmount: number }> {
    const orderAggregate = this.publisher.mergeObjectContext(
      new OrderAggregate(),
    );

    orderAggregate.create(
      command.customerId,
      command.restaurantId,
      command.items,
      command.deliveryAddress,
      command.totalAmount,
      command.deliveryFee,
      command.currency,
    );

    // Commit events first to ensure downstream services are notified before persistence
    // If event publishing fails, order is not saved and can be retried
    orderAggregate.commit();

    await this.orderAggregateRepository.save({
      id: orderAggregate.id,
      customerId: orderAggregate.customerId,
      restaurantId: orderAggregate.restaurantId,
      driverId: orderAggregate.driverId,
      items: orderAggregate.items,
      deliveryAddress: orderAggregate.deliveryAddress,
      status: orderAggregate.status,
      totalAmount: orderAggregate.totalAmount,
      deliveryFee: orderAggregate.deliveryFee,
      currency: orderAggregate.currency,
      estimatedDeliveryTime: orderAggregate.estimatedDeliveryTime,
      actualDeliveryTime: orderAggregate.actualDeliveryTime,
      cancelledAt: orderAggregate.cancelledAt,
      cancellationReason: orderAggregate.cancellationReason,
      createdAt: orderAggregate.createdAt,
      updatedAt: orderAggregate.updatedAt,
    });

    return {
      id: orderAggregate.id,
      totalAmount: orderAggregate.totalAmount + orderAggregate.deliveryFee,
    };
  }
}

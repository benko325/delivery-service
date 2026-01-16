import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrderStatusCommand } from './update-order-status.command';
import { IOrderAggregateRepository } from '../../../core/repositories/order.repository.interface';
import { OrderAggregate } from '../../../core/aggregates/order.aggregate';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusCommandHandler
    implements ICommandHandler<UpdateOrderStatusCommand>
{
    constructor(
        @Inject('IOrderAggregateRepository')
        private readonly orderAggregateRepository: IOrderAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateOrderStatusCommand): Promise<{ success: boolean }> {
        const order = await this.orderAggregateRepository.findById(command.orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${command.orderId} not found`);
        }

        const orderAggregate = this.publisher.mergeObjectContext(new OrderAggregate());
        orderAggregate.loadState(order);

        orderAggregate.updateStatus(command.status);

        await this.orderAggregateRepository.update(command.orderId, {
            status: orderAggregate.status,
            actualDeliveryTime: orderAggregate.actualDeliveryTime,
            updatedAt: orderAggregate.updatedAt,
        });

        orderAggregate.commit();

        return { success: true };
    }
}

import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CancelOrderCommand } from './cancel-order.command';
import { IOrderAggregateRepository } from '../../../core/repositories/order.repository.interface';
import { OrderAggregate } from '../../../core/aggregates/order.aggregate';

@CommandHandler(CancelOrderCommand)
export class CancelOrderCommandHandler implements ICommandHandler<CancelOrderCommand> {
    constructor(
        @Inject('IOrderAggregateRepository')
        private readonly orderAggregateRepository: IOrderAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: CancelOrderCommand): Promise<{ success: boolean }> {
        const order = await this.orderAggregateRepository.findById(command.orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${command.orderId} not found`);
        }

        const orderAggregate = this.publisher.mergeObjectContext(new OrderAggregate());
        orderAggregate.loadState(order);

        orderAggregate.cancel(command.reason);

        await this.orderAggregateRepository.update(command.orderId, {
            status: orderAggregate.status,
            cancelledAt: orderAggregate.cancelledAt,
            cancellationReason: orderAggregate.cancellationReason,
            updatedAt: orderAggregate.updatedAt,
        });

        orderAggregate.commit();

        return { success: true };
    }
}

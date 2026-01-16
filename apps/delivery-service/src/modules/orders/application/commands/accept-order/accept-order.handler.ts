import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { AcceptOrderCommand } from './accept-order.command';
import { IOrderAggregateRepository } from '../../../core/repositories/order.repository.interface';
import { OrderAggregate } from '../../../core/aggregates/order.aggregate';

@CommandHandler(AcceptOrderCommand)
export class AcceptOrderCommandHandler implements ICommandHandler<AcceptOrderCommand> {
    constructor(
        @Inject('IOrderAggregateRepository')
        private readonly orderAggregateRepository: IOrderAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: AcceptOrderCommand): Promise<{ success: boolean }> {
        const order = await this.orderAggregateRepository.findById(command.orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${command.orderId} not found`);
        }

        if (order.driverId) {
            throw new BadRequestException('Order already has a driver assigned');
        }

        const orderAggregate = this.publisher.mergeObjectContext(new OrderAggregate());
        orderAggregate.loadState(order);

        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(
            estimatedDeliveryTime.getMinutes() + command.estimatedMinutes,
        );

        orderAggregate.acceptByDriver(command.driverId, estimatedDeliveryTime);

        await this.orderAggregateRepository.update(command.orderId, {
            driverId: orderAggregate.driverId,
            status: orderAggregate.status,
            estimatedDeliveryTime: orderAggregate.estimatedDeliveryTime,
            updatedAt: orderAggregate.updatedAt,
        });

        orderAggregate.commit();

        return { success: true };
    }
}

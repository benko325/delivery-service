import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetOrderByIdQuery } from './get-order-by-id.query';
import { IOrderRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdQueryHandler implements IQueryHandler<GetOrderByIdQuery> {
    constructor(
        @Inject('IOrderRepository')
        private readonly orderRepository: IOrderRepository,
    ) {}

    async execute(query: GetOrderByIdQuery): Promise<Order> {
        const order = await this.orderRepository.findById(query.orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${query.orderId} not found`);
        }

        return order;
    }
}

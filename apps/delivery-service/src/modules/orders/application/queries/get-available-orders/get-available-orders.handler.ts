import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableOrdersQuery } from './get-available-orders.query';
import { IOrderRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';

@QueryHandler(GetAvailableOrdersQuery)
export class GetAvailableOrdersQueryHandler
    implements IQueryHandler<GetAvailableOrdersQuery>
{
    constructor(
        @Inject('IOrderRepository')
        private readonly orderRepository: IOrderRepository,
    ) {}

    async execute(_query: GetAvailableOrdersQuery): Promise<Order[]> {
        return this.orderRepository.findAvailableForDrivers();
    }
}

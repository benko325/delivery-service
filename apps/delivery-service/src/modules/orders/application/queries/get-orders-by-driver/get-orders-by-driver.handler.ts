import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetOrdersByDriverQuery } from './get-orders-by-driver.query';
import { IOrderRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';

@QueryHandler(GetOrdersByDriverQuery)
export class GetOrdersByDriverQueryHandler implements IQueryHandler<GetOrdersByDriverQuery> {
    constructor(
        @Inject('IOrderRepository')
        private readonly orderRepository: IOrderRepository,
    ) {}

    async execute(query: GetOrdersByDriverQuery): Promise<Order[]> {
        return this.orderRepository.findByDriverId(query.driverId);
    }
}

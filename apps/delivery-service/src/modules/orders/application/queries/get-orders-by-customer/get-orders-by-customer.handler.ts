import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetOrdersByCustomerQuery } from './get-orders-by-customer.query';
import { IOrderRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';

@QueryHandler(GetOrdersByCustomerQuery)
export class GetOrdersByCustomerQueryHandler
    implements IQueryHandler<GetOrdersByCustomerQuery>
{
    constructor(
        @Inject('IOrderRepository')
        private readonly orderRepository: IOrderRepository,
    ) {}

    async execute(query: GetOrdersByCustomerQuery): Promise<Order[]> {
        return this.orderRepository.findByCustomerId(query.customerId);
    }
}

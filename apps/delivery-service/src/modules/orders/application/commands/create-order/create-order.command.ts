import { ICommand } from '@nestjs/cqrs';
import { OrderItem, DeliveryAddress } from '../../../core/types/order-database.types';

export class CreateOrderCommand implements ICommand {
    constructor(
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly items: OrderItem[],
        public readonly deliveryAddress: DeliveryAddress,
        public readonly totalAmount: number,
        public readonly deliveryFee: number,
    ) {}
}

import { ICommand } from '@nestjs/cqrs';
import { OrderStatus } from '../../../core/types/order-database.types';

export class UpdateOrderStatusCommand implements ICommand {
    constructor(
        public readonly orderId: string,
        public readonly status: OrderStatus,
    ) {}
}

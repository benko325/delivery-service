import { IEvent } from '@nestjs/cqrs';
import { OrderStatus } from '../types/order-database.types';

export class OrderStatusChangedEvent implements IEvent {
    constructor(
        public readonly orderId: string,
        public readonly previousStatus: OrderStatus,
        public readonly newStatus: OrderStatus,
        public readonly changedAt: Date,
    ) {}
}

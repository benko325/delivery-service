import { IEvent } from '@nestjs/cqrs';

export class CartClearedEvent implements IEvent {
    constructor(
        public readonly cartId: string,
        public readonly customerId: string,
        public readonly clearedAt: Date,
    ) {}
}

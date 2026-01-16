import { IEvent } from '@nestjs/cqrs';

export class CartItemAddedEvent implements IEvent {
    constructor(
        public readonly cartId: string,
        public readonly customerId: string,
        public readonly menuItemId: string,
        public readonly quantity: number,
        public readonly addedAt: Date,
    ) {}
}

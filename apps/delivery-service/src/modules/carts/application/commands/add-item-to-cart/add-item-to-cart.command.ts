import { ICommand } from '@nestjs/cqrs';

export class AddItemToCartCommand implements ICommand {
    constructor(
        public readonly customerId: string,
        public readonly menuItemId: string,
        public readonly restaurantId: string,
        public readonly name: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly quantity: number,
    ) {}
}

import { ICommand } from '@nestjs/cqrs';

export class UpdateItemQuantityCommand implements ICommand {
    constructor(
        public readonly customerId: string,
        public readonly menuItemId: string,
        public readonly quantity: number,
    ) {}
}

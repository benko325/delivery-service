import { ICommand } from '@nestjs/cqrs';

export class RemoveItemFromCartCommand implements ICommand {
    constructor(
        public readonly customerId: string,
        public readonly menuItemId: string,
    ) {}
}

import { ICommand } from '@nestjs/cqrs';

export class CancelOrderCommand implements ICommand {
    constructor(
        public readonly orderId: string,
        public readonly reason: string,
    ) {}
}

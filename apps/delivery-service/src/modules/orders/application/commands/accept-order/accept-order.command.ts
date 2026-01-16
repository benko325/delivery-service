import { ICommand } from '@nestjs/cqrs';

export class AcceptOrderCommand implements ICommand {
    constructor(
        public readonly orderId: string,
        public readonly driverId: string,
        public readonly estimatedMinutes: number,
    ) {}
}

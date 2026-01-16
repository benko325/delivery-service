import { IEvent } from '@nestjs/cqrs';

export class CustomerUpdatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly phone: string,
        public readonly updatedAt: Date,
    ) {}
}

import { IEvent } from '@nestjs/cqrs';

export class CustomerCreatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        public readonly phone: string,
        public readonly createdAt: Date,
    ) {}
}

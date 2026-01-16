import { IEvent } from '@nestjs/cqrs';

export class DriverCreatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string,
        public readonly createdAt: Date,
    ) {}
}

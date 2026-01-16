import { IEvent } from '@nestjs/cqrs';

export class OrderAcceptedByDriverEvent implements IEvent {
    constructor(
        public readonly orderId: string,
        public readonly driverId: string,
        public readonly acceptedAt: Date,
    ) {}
}

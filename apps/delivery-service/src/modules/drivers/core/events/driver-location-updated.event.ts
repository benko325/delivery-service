import { IEvent } from '@nestjs/cqrs';
import { DriverLocation } from '../types/driver-database.types';

export class DriverLocationUpdatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly location: DriverLocation,
        public readonly updatedAt: Date,
    ) {}
}

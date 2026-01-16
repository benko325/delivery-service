import { IEvent } from '@nestjs/cqrs';
import { DriverStatus } from '../types/driver-database.types';

export class DriverAvailabilityChangedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly previousStatus: DriverStatus,
        public readonly newStatus: DriverStatus,
        public readonly changedAt: Date,
    ) {}
}

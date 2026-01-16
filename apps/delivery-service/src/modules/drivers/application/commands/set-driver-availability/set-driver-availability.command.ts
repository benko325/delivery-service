import { ICommand } from '@nestjs/cqrs';
import { DriverStatus } from '../../../core/types/driver-database.types';

export class SetDriverAvailabilityCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly status: DriverStatus,
        public readonly isUserId: boolean = false,
    ) {}
}

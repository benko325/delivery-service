import { IEvent } from '@nestjs/cqrs';
import { CustomerAddress } from '../types/customer-database.types';

export class CustomerAddressUpdatedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly address: CustomerAddress,
        public readonly updatedAt: Date,
    ) {}
}

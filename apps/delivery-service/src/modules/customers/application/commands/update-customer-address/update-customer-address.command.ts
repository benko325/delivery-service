import { ICommand } from '@nestjs/cqrs';
import { CustomerAddress } from '../../../core/types/customer-database.types';

export class UpdateCustomerAddressCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly address: CustomerAddress,
    ) {}
}

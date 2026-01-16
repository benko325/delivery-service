import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCustomerAddressCommand } from './update-customer-address.command';
import { ICustomerAggregateRepository } from '../../../core/repositories/customer.repository.interface';
import { CustomerAggregate } from '../../../core/aggregates/customer.aggregate';

@CommandHandler(UpdateCustomerAddressCommand)
export class UpdateCustomerAddressCommandHandler
    implements ICommandHandler<UpdateCustomerAddressCommand>
{
    constructor(
        @Inject('ICustomerAggregateRepository')
        private readonly customerAggregateRepository: ICustomerAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateCustomerAddressCommand): Promise<{ success: boolean }> {
        const existingCustomer = await this.customerAggregateRepository.findById(command.id);

        if (!existingCustomer) {
            throw new NotFoundException(`Customer with ID ${command.id} not found`);
        }

        const customerAggregate = this.publisher.mergeObjectContext(new CustomerAggregate());
        customerAggregate.loadState(existingCustomer);
        customerAggregate.updateAddress(command.address);

        await this.customerAggregateRepository.update(command.id, {
            address: customerAggregate.address,
            updatedAt: customerAggregate.updatedAt,
        });

        customerAggregate.commit();

        return { success: true };
    }
}

import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCustomerCommand } from './update-customer.command';
import { ICustomerAggregateRepository } from '../../../core/repositories/customer.repository.interface';
import { CustomerAggregate } from '../../../core/aggregates/customer.aggregate';

@CommandHandler(UpdateCustomerCommand)
export class UpdateCustomerCommandHandler implements ICommandHandler<UpdateCustomerCommand> {
    constructor(
        @Inject('ICustomerAggregateRepository')
        private readonly customerAggregateRepository: ICustomerAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateCustomerCommand): Promise<{ success: boolean }> {
        const existingCustomer = await this.customerAggregateRepository.findById(command.id);

        if (!existingCustomer) {
            throw new NotFoundException(`Customer with ID ${command.id} not found`);
        }

        const customerAggregate = this.publisher.mergeObjectContext(new CustomerAggregate());
        customerAggregate.loadState(existingCustomer);
        customerAggregate.update(command.name, command.phone);

        await this.customerAggregateRepository.update(command.id, {
            name: customerAggregate.name,
            phone: customerAggregate.phone,
            updatedAt: customerAggregate.updatedAt,
        });

        customerAggregate.commit();

        return { success: true };
    }
}

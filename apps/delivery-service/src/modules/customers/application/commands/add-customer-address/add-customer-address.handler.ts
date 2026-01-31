import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { AddCustomerAddressCommand } from "./add-customer-address.command";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { CustomerAggregate } from "../../../core/aggregates/customer.aggregate";

@CommandHandler(AddCustomerAddressCommand)
export class AddCustomerAddressCommandHandler implements ICommandHandler<AddCustomerAddressCommand> {
  constructor(
    @Inject("ICustomerAggregateRepository")
    private readonly customerAggregateRepository: ICustomerAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: AddCustomerAddressCommand,
  ): Promise<{ success: boolean }> {
    const existingCustomer = await this.customerAggregateRepository.findById(
      command.id,
    );

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${command.id} not found`);
    }

    const customerAggregate = this.publisher.mergeObjectContext(
      new CustomerAggregate(),
    );
    customerAggregate.loadState(existingCustomer);
    customerAggregate.addAddress(command.address);

    await this.customerAggregateRepository.update(command.id, {
      addresses: customerAggregate.addresses,
      updatedAt: customerAggregate.updatedAt,
    });

    customerAggregate.commit();

    return { success: true };
  }
}

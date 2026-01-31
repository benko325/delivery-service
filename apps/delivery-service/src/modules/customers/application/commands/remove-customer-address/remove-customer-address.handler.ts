import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { RemoveCustomerAddressCommand } from "./remove-customer-address.command";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { CustomerAggregate } from "../../../core/aggregates/customer.aggregate";

@CommandHandler(RemoveCustomerAddressCommand)
export class RemoveCustomerAddressCommandHandler implements ICommandHandler<RemoveCustomerAddressCommand> {
  constructor(
    @Inject("ICustomerAggregateRepository")
    private readonly customerAggregateRepository: ICustomerAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: RemoveCustomerAddressCommand,
  ): Promise<{ success: boolean }> {
    const existingCustomer = await this.customerAggregateRepository.findById(
      command.customerId,
    );
    if (!existingCustomer) {
      throw new NotFoundException(
        `Customer with ID ${command.customerId} not found`,
      );
    }

    const aggregate = this.publisher.mergeObjectContext(
      new CustomerAggregate(),
    );
    aggregate.loadState(existingCustomer);

    aggregate.removeAddress(command.addressId);

    await this.customerAggregateRepository.update(command.customerId, {
      addresses: aggregate.addresses,
      updatedAt: aggregate.updatedAt,
    });

    aggregate.commit();
    return { success: true };
  }
}

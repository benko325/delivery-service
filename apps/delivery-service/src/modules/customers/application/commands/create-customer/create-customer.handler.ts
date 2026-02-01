import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateCustomerCommand } from "./create-customer.command";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { CustomerAggregate } from "../../../core/aggregates/customer.aggregate";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics";

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerCommandHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(
    @Inject("ICustomerAggregateRepository")
    private readonly customerAggregateRepository: ICustomerAggregateRepository,
    private readonly publisher: EventPublisher,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<{ id: string }> {
    const customerAggregate = this.publisher.mergeObjectContext(
      new CustomerAggregate(),
    );

    customerAggregate.create(
      command.id,
      command.email,
      command.name,
      command.phone,
    );

    await this.customerAggregateRepository.save({
      id: customerAggregate.id,
      email: customerAggregate.email,
      name: customerAggregate.name,
      phone: customerAggregate.phone,
      addresses: customerAggregate.addresses,
      favoriteRestaurantIds: customerAggregate.favoriteRestaurantIds,
      createdAt: customerAggregate.createdAt,
      updatedAt: customerAggregate.updatedAt,
    });

    customerAggregate.commit();

    // Record metrics
    this.metricsService.incrementCustomersRegistered();

    return { id: customerAggregate.id };
  }
}

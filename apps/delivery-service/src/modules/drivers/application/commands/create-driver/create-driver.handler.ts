import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateDriverCommand } from "./create-driver.command";
import { IDriverAggregateRepository } from "../../../core/repositories/driver.repository.interface";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";

@CommandHandler(CreateDriverCommand)
export class CreateDriverCommandHandler
  implements ICommandHandler<CreateDriverCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateDriverCommand): Promise<{ id: string }> {
    const driverAggregate = this.publisher.mergeObjectContext(
      new DriverAggregate(),
    );

    driverAggregate.create(
      command.userId,
      command.vehicleType,
      command.licensePlate,
    );

    await this.driverAggregateRepository.save({
      id: driverAggregate.id,
      userId: driverAggregate.userId,
      vehicleType: driverAggregate.vehicleType,
      licensePlate: driverAggregate.licensePlate,
      status: driverAggregate.status,
      currentLocation: driverAggregate.currentLocation,
      rating: driverAggregate.rating,
      totalDeliveries: driverAggregate.totalDeliveries,
      isActive: driverAggregate.isActive,
      createdAt: driverAggregate.createdAt,
      updatedAt: driverAggregate.updatedAt,
    });

    driverAggregate.commit();

    return { id: driverAggregate.id };
  }
}

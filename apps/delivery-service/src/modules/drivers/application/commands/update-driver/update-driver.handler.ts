import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { UpdateDriverCommand } from "./update-driver.command";
import {
  IDriverAggregateRepository,
  IDriverRepository,
} from "../../../core/repositories/driver.repository.interface";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";

@CommandHandler(UpdateDriverCommand)
export class UpdateDriverCommandHandler
  implements ICommandHandler<UpdateDriverCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
    @Inject("IDriverRepository")
    private readonly driverRepository: IDriverRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateDriverCommand): Promise<{ success: boolean }> {
    let driverAggregate: DriverAggregate | null;

    if (command.isUserId) {
      const existingDriver = await this.driverRepository.findByUserId(
        command.id,
      );
      if (!existingDriver) {
        throw new NotFoundException(`Driver not found`);
      }
      driverAggregate = new DriverAggregate();
      driverAggregate.loadState(existingDriver);
    } else {
      driverAggregate = await this.driverAggregateRepository.findById(
        command.id,
      );
      if (!driverAggregate) {
        throw new NotFoundException(`Driver not found`);
      }
    }

    const publishedAggregate =
      this.publisher.mergeObjectContext(driverAggregate);
    publishedAggregate.update(command.vehicleType, command.licensePlate);

    await this.driverAggregateRepository.save(publishedAggregate);
    publishedAggregate.commit();

    return { success: true };
  }
}

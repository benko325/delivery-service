import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { UpdateDriverLocationCommand } from "./update-driver-location.command";
import {
  IDriverAggregateRepository,
  IDriverRepository,
} from "../../../core/repositories/driver.repository.interface";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";

@CommandHandler(UpdateDriverLocationCommand)
export class UpdateDriverLocationCommandHandler
  implements ICommandHandler<UpdateDriverLocationCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
    @Inject("IDriverRepository")
    private readonly driverRepository: IDriverRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: UpdateDriverLocationCommand,
  ): Promise<{ success: boolean }> {
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
    publishedAggregate.updateLocation(command.latitude, command.longitude);

    await this.driverAggregateRepository.save(publishedAggregate);
    publishedAggregate.commit();

    return { success: true };
  }
}

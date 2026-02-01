import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { AcceptDeliveryCommand } from "./accept-delivery.command";
import {
  IDriverAggregateRepository,
  IDriverRepository,
} from "../../../core/repositories/driver.repository.interface";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";

@CommandHandler(AcceptDeliveryCommand)
export class AcceptDeliveryCommandHandler
  implements ICommandHandler<AcceptDeliveryCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
    @Inject("IDriverRepository")
    private readonly driverRepository: IDriverRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: AcceptDeliveryCommand): Promise<{ success: boolean }> {
    const existingDriver = await this.driverRepository.findByUserId(
      command.driverId,
    );

    if (!existingDriver) {
      throw new NotFoundException("Driver not found");
    }

    const driverAggregate = new DriverAggregate();
    driverAggregate.loadState(existingDriver);

    const publishedAggregate =
      this.publisher.mergeObjectContext(driverAggregate);
    publishedAggregate.assignDelivery(command.orderId);

    await this.driverAggregateRepository.save(publishedAggregate);
    publishedAggregate.commit();

    return { success: true };
  }
}

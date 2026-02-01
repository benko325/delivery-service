import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { RejectDeliveryCommand } from "./reject-delivery.command";
import {
  IDriverAggregateRepository,
  IDriverRepository,
} from "../../../core/repositories/driver.repository.interface";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";

@CommandHandler(RejectDeliveryCommand)
export class RejectDeliveryCommandHandler
  implements ICommandHandler<RejectDeliveryCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
    @Inject("IDriverRepository")
    private readonly driverRepository: IDriverRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RejectDeliveryCommand): Promise<{ success: boolean }> {
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
    publishedAggregate.rejectDelivery(command.orderId, command.reason);

    publishedAggregate.commit();

    return { success: true };
  }
}

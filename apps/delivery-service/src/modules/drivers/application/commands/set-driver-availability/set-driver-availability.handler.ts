import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SetDriverAvailabilityCommand } from './set-driver-availability.command';
import { IDriverAggregateRepository, IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { DriverAggregate } from '../../../core/aggregates/driver.aggregate';

@CommandHandler(SetDriverAvailabilityCommand)
export class SetDriverAvailabilityCommandHandler
    implements ICommandHandler<SetDriverAvailabilityCommand>
{
    constructor(
        @Inject('IDriverAggregateRepository')
        private readonly driverAggregateRepository: IDriverAggregateRepository,
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: SetDriverAvailabilityCommand): Promise<{ success: boolean }> {
        const existingDriver = command.isUserId
            ? await this.driverRepository.findByUserId(command.id)
            : await this.driverAggregateRepository.findById(command.id);

        if (!existingDriver) {
            throw new NotFoundException(`Driver not found`);
        }

        const driverAggregate = this.publisher.mergeObjectContext(new DriverAggregate());
        driverAggregate.loadState(existingDriver);

        driverAggregate.setAvailability(command.status);

        await this.driverAggregateRepository.update(existingDriver.id, {
            status: driverAggregate.status,
            updatedAt: driverAggregate.updatedAt,
        });

        driverAggregate.commit();

        return { success: true };
    }
}

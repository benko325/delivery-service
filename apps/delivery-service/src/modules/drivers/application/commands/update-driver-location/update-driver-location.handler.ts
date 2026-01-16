import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateDriverLocationCommand } from './update-driver-location.command';
import { IDriverAggregateRepository, IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { DriverAggregate } from '../../../core/aggregates/driver.aggregate';

@CommandHandler(UpdateDriverLocationCommand)
export class UpdateDriverLocationCommandHandler
    implements ICommandHandler<UpdateDriverLocationCommand>
{
    constructor(
        @Inject('IDriverAggregateRepository')
        private readonly driverAggregateRepository: IDriverAggregateRepository,
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateDriverLocationCommand): Promise<{ success: boolean }> {
        const existingDriver = command.isUserId
            ? await this.driverRepository.findByUserId(command.id)
            : await this.driverAggregateRepository.findById(command.id);

        if (!existingDriver) {
            throw new NotFoundException(`Driver not found`);
        }

        const driverAggregate = this.publisher.mergeObjectContext(new DriverAggregate());
        driverAggregate.loadState(existingDriver);

        driverAggregate.updateLocation(command.latitude, command.longitude);

        await this.driverAggregateRepository.update(existingDriver.id, {
            currentLocation: driverAggregate.currentLocation,
            updatedAt: driverAggregate.updatedAt,
        });

        driverAggregate.commit();

        return { success: true };
    }
}

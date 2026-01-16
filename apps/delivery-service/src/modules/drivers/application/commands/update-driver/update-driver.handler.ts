import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateDriverCommand } from './update-driver.command';
import { IDriverAggregateRepository, IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { DriverAggregate } from '../../../core/aggregates/driver.aggregate';

@CommandHandler(UpdateDriverCommand)
export class UpdateDriverCommandHandler implements ICommandHandler<UpdateDriverCommand> {
    constructor(
        @Inject('IDriverAggregateRepository')
        private readonly driverAggregateRepository: IDriverAggregateRepository,
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateDriverCommand): Promise<{ success: boolean }> {
        const existingDriver = command.isUserId
            ? await this.driverRepository.findByUserId(command.id)
            : await this.driverAggregateRepository.findById(command.id);

        if (!existingDriver) {
            throw new NotFoundException(`Driver not found`);
        }

        const driverAggregate = this.publisher.mergeObjectContext(new DriverAggregate());
        driverAggregate.loadState(existingDriver);

        driverAggregate.update(
            command.name,
            command.phone,
            command.vehicleType,
            command.licensePlate,
        );

        await this.driverAggregateRepository.update(existingDriver.id, {
            name: driverAggregate.name,
            phone: driverAggregate.phone,
            vehicleType: driverAggregate.vehicleType,
            licensePlate: driverAggregate.licensePlate,
            updatedAt: driverAggregate.updatedAt,
        });

        driverAggregate.commit();

        return { success: true };
    }
}

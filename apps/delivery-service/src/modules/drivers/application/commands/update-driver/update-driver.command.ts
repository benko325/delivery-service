import { ICommand } from '@nestjs/cqrs';

export class UpdateDriverCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly phone: string,
        public readonly vehicleType: string,
        public readonly licensePlate: string,
        public readonly isUserId: boolean = false,
    ) {}
}

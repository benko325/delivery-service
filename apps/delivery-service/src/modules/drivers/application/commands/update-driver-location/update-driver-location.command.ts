import { ICommand } from '@nestjs/cqrs';

export class UpdateDriverLocationCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly isUserId: boolean = false,
    ) {}
}

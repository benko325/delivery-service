import { ICommand } from '@nestjs/cqrs';

export class UpdateCustomerCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly phone: string,
    ) {}
}

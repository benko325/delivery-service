import { ICommand } from '@nestjs/cqrs';

export class CreateCustomerCommand implements ICommand {
    constructor(
        public readonly id: string | null,
        public readonly email: string,
        public readonly name: string,
        public readonly phone: string,
    ) {}
}

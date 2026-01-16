import { ICommand } from '@nestjs/cqrs';

export class ClearCartCommand implements ICommand {
    constructor(public readonly customerId: string) {}
}

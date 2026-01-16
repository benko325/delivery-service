import { ICommand } from '@nestjs/cqrs';

export class DeleteMenuItemCommand implements ICommand {
    constructor(public readonly id: string) {}
}

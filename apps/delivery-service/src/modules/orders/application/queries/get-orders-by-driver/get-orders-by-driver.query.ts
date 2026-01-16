import { IQuery } from '@nestjs/cqrs';

export class GetOrdersByDriverQuery implements IQuery {
    constructor(public readonly driverId: string) {}
}

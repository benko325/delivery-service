import { IQuery } from '@nestjs/cqrs';

export class GetAvailableOrdersQuery implements IQuery {
    constructor() {}
}

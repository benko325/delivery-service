import { IQuery } from '@nestjs/cqrs';

export class GetAllDriversQuery implements IQuery {
    constructor() {}
}

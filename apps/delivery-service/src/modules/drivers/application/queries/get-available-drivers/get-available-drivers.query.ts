import { IQuery } from '@nestjs/cqrs';

export class GetAvailableDriversQuery implements IQuery {
    constructor() {}
}

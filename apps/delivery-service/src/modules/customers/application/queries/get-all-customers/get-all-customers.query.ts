import { IQuery } from '@nestjs/cqrs';

export class GetAllCustomersQuery implements IQuery {
    constructor() {}
}

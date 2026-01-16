import { IQuery } from '@nestjs/cqrs';

export class GetOrdersByCustomerQuery implements IQuery {
    constructor(public readonly customerId: string) {}
}

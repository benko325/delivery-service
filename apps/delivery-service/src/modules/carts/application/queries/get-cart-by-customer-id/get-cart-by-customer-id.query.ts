import { IQuery } from '@nestjs/cqrs';

export class GetCartByCustomerIdQuery implements IQuery {
    constructor(public readonly customerId: string) {}
}

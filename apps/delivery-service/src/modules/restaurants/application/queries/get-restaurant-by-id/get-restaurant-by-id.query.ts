import { IQuery } from '@nestjs/cqrs';

export class GetRestaurantByIdQuery implements IQuery {
    constructor(public readonly id: string) {}
}

import { IQuery } from '@nestjs/cqrs';

export class GetAllRestaurantsQuery implements IQuery {
    constructor(public readonly activeOnly: boolean = true) {}
}

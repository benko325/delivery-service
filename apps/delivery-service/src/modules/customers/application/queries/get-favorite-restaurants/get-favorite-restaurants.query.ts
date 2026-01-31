import { IQuery } from "@nestjs/cqrs";

export class GetFavoriteRestaurantsQuery implements IQuery {
  constructor(public readonly customerId: string) {}
}

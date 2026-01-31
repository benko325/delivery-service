import { ICommand } from "@nestjs/cqrs";

export class AddRestaurantToFavoritesCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly restaurantId: string,
  ) {}
}

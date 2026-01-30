import { ICommand } from "@nestjs/cqrs";

export class RemoveRestaurantFromFavoritesCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly restaurantId: string,
  ) {}
}

import { ICommand } from "@nestjs/cqrs";

export class DeactivateRestaurantCommand implements ICommand {
  constructor(
    public readonly restaurantId: string,
    public readonly userId: string,
    public readonly userRoles: string[],
  ) {}
}

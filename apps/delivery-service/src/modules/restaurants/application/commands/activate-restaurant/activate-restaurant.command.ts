import { ICommand } from "@nestjs/cqrs";

export class ActivateRestaurantCommand implements ICommand {
  constructor(public readonly restaurantId: string) {}
}

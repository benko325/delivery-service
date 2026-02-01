import { ICommand } from "@nestjs/cqrs";
import { RestaurantAddress } from "../../../core/types/restaurant-database.types";

export class UpdateRestaurantCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userRoles: string[],
    public readonly name: string,
    public readonly description: string,
    public readonly address: RestaurantAddress,
    public readonly phone: string,
    public readonly email: string,
    public readonly openingHours: Record<
      string,
      { open: string; close: string }
    >,
  ) {}
}

import { ICommand } from "@nestjs/cqrs";

export class RejectOrderCommand implements ICommand {
  constructor(
    public readonly restaurantId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}

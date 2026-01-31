import { ICommand } from "@nestjs/cqrs";

export class ConfirmOrderCommand implements ICommand {
  constructor(
    public readonly restaurantId: string,
    public readonly orderId: string,
    public readonly estimatedPreparationMinutes: number,
  ) {}
}

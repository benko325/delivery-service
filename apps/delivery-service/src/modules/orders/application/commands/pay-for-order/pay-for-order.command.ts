import { ICommand } from "@nestjs/cqrs";

export class PayForOrderCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
  ) {}
}

import { ICommand } from "@nestjs/cqrs";

export class RejectDeliveryCommand implements ICommand {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}

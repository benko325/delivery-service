import { ICommand } from "@nestjs/cqrs";

export class AcceptDeliveryCommand implements ICommand {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
  ) {}
}

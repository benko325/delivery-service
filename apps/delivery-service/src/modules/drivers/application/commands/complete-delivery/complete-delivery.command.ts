import { ICommand } from "@nestjs/cqrs";

export class CompleteDeliveryCommand implements ICommand {
  constructor(
    public readonly driverId: string,
    public readonly rating: number = 5.0,
  ) {}
}

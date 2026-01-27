import { ICommand } from "@nestjs/cqrs";

export class CreateDriverCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly vehicleType: string,
    public readonly licensePlate: string,
  ) {}
}

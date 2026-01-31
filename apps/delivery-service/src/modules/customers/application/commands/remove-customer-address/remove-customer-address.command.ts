import { ICommand } from "@nestjs/cqrs";

export class RemoveCustomerAddressCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly addressId: string,
  ) {}
}

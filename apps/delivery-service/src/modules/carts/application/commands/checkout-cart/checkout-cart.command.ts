import { ICommand } from "@nestjs/cqrs";
import { DeliveryAddress } from "../../../core/types/delivery-address.types";

export class CheckoutCartCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly deliveryAddress: DeliveryAddress,
    public readonly deliveryFee: number,
  ) {}
}

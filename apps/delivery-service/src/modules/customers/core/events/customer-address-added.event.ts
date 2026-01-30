import { CustomerAddress } from "../types/customer-database.types";

export class CustomerAddressAddedEvent {
  constructor(
    public readonly customerId: string,
    public readonly address: CustomerAddress,
    public readonly occurredAt: Date,
  ) {}
}

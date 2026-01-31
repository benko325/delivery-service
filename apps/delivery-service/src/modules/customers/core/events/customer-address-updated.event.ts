import { IEvent } from "@nestjs/cqrs";
import { CustomerAddress } from "../types/customer-database.types";

export class CustomerAddressUpdatedEvent implements IEvent {
  public readonly id: string;
  public readonly address: CustomerAddress;
  public readonly updatedAt: Date;

  constructor(data: { id: string; address: CustomerAddress; updatedAt: Date }) {
    this.id = data.id;
    this.address = data.address;
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
  }
}

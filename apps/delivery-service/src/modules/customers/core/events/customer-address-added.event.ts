import { CustomerAddress } from "../types/customer-database.types";

export class CustomerAddressAddedEvent {
  public readonly id: string;
  public readonly address: CustomerAddress;
  public readonly updatedAt: Date;

  constructor(params: {
    id: string;
    address: CustomerAddress;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.address = params.address;
    this.updatedAt = params.updatedAt;
  }
}

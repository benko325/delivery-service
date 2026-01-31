export class CustomerAddressRemovedEvent {
  public readonly id: string;
  public readonly addressId: string;
  public readonly updatedAt: Date;

  constructor(params: {
    id: string;
    addressId: string;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.addressId = params.addressId;
    this.updatedAt = params.updatedAt;
  }
}

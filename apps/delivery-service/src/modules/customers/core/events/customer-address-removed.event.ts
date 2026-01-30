export class CustomerAddressRemovedEvent {
  constructor(
    public readonly customerId: string,
    public readonly addressId: string,
    public readonly occurredAt: Date,
  ) {}
}

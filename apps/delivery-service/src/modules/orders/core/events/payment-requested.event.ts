import { IEvent } from "@nestjs/cqrs";

export class PaymentRequestedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly requestedAt: Date,
  ) {}
}

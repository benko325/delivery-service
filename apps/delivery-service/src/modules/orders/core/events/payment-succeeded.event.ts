import { IEvent } from "@nestjs/cqrs";

export class PaymentSucceededEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paidAt: Date,
  ) {}
}

import { IEvent } from "@nestjs/cqrs";

export class OrderAcceptedByDriverEvent implements IEvent {
  public readonly orderId: string;
  public readonly driverId: string;
  public readonly acceptedAt: Date;

  constructor(data: { orderId: string; driverId: string; acceptedAt: Date }) {
    this.orderId = data.orderId;
    this.driverId = data.driverId;
    this.acceptedAt =
      data.acceptedAt instanceof Date
        ? data.acceptedAt
        : new Date(data.acceptedAt);
  }
}

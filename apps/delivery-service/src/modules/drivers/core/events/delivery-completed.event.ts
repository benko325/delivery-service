import { IEvent } from "@nestjs/cqrs";

export class DeliveryCompletedEvent implements IEvent {
  public readonly driverId: string;
  public readonly orderId: string;
  public readonly completedAt: Date;

  constructor(params: {
    driverId: string;
    orderId: string;
    completedAt: Date;
  }) {
    this.driverId = params.driverId;
    this.orderId = params.orderId;
    this.completedAt =
      params.completedAt instanceof Date
        ? params.completedAt
        : new Date(params.completedAt);
  }
}

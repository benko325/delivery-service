import { IEvent } from "@nestjs/cqrs";

export class DeliveryRejectedEvent implements IEvent {
  public readonly driverId: string;
  public readonly orderId: string;
  public readonly reason: string;
  public readonly rejectedAt: Date;

  constructor(params: {
    driverId: string;
    orderId: string;
    reason: string;
    rejectedAt: Date;
  }) {
    this.driverId = params.driverId;
    this.orderId = params.orderId;
    this.reason = params.reason;
    this.rejectedAt =
      params.rejectedAt instanceof Date
        ? params.rejectedAt
        : new Date(params.rejectedAt);
  }
}

import { IEvent } from "@nestjs/cqrs";

export class DeliveryAssignedEvent implements IEvent {
  public readonly driverId: string;
  public readonly orderId: string;
  public readonly assignedAt: Date;

  constructor(params: { driverId: string; orderId: string; assignedAt: Date }) {
    this.driverId = params.driverId;
    this.orderId = params.orderId;
    this.assignedAt =
      params.assignedAt instanceof Date
        ? params.assignedAt
        : new Date(params.assignedAt);
  }
}

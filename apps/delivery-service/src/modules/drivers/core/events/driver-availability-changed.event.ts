import { IEvent } from "@nestjs/cqrs";
import { DriverStatus } from "../types/driver-database.types";

export class DriverAvailabilityChangedEvent implements IEvent {
  public readonly id: string;
  public readonly previousStatus: DriverStatus;
  public readonly newStatus: DriverStatus;
  public readonly changedAt: Date;

  constructor(data: {
    id: string;
    previousStatus: DriverStatus;
    newStatus: DriverStatus;
    changedAt: Date;
  }) {
    this.id = data.id;
    this.previousStatus = data.previousStatus;
    this.newStatus = data.newStatus;
    this.changedAt =
      data.changedAt instanceof Date
        ? data.changedAt
        : new Date(data.changedAt);
  }
}

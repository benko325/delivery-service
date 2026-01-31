import { IEvent } from "@nestjs/cqrs";
import { DriverStatus } from "../types/driver-database.types";

export class DriverAvailabilityChangedEvent implements IEvent {
  public readonly id: string;
  public readonly previousStatus: DriverStatus;
  public readonly newStatus: DriverStatus;
  public readonly changedAt: Date;

  constructor(params: {
    id: string;
    previousStatus: DriverStatus;
    newStatus: DriverStatus;
    changedAt: Date;
  }) {
    this.id = params.id;
    this.previousStatus = params.previousStatus;
    this.newStatus = params.newStatus;
    this.changedAt = params.changedAt;
  }
}

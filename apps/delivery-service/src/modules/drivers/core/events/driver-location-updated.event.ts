import { IEvent } from "@nestjs/cqrs";
import { DriverLocation } from "../types/driver-database.types";

export class DriverLocationUpdatedEvent implements IEvent {
  public readonly id: string;
  public readonly location: DriverLocation;
  public readonly updatedAt: Date;

  constructor(data: { id: string; location: DriverLocation; updatedAt: Date }) {
    this.id = data.id;
    this.location = data.location;
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
  }
}

import { IEvent } from "@nestjs/cqrs";
import { DriverLocation } from "../types/driver-database.types";

export class DriverLocationUpdatedEvent implements IEvent {
  public readonly id: string;
  public readonly location: DriverLocation;
  public readonly updatedAt: Date;

  constructor(params: {
    id: string;
    location: DriverLocation;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.location = params.location;
    this.updatedAt = params.updatedAt;
  }
}

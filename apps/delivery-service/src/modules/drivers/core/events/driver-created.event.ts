import { IEvent } from "@nestjs/cqrs";

export class DriverCreatedEvent implements IEvent {
  public readonly id: string;
  public readonly userId: string;
  public readonly createdAt: Date;

  constructor(params: { id: string; userId: string; createdAt: Date }) {
    this.id = params.id;
    this.userId = params.userId;
    this.createdAt = params.createdAt;
  }
}

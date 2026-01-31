import { IEvent } from "@nestjs/cqrs";

export class DriverCreatedEvent implements IEvent {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly email: string;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}

import { IEvent } from "@nestjs/cqrs";

export class CustomerCreatedEvent implements IEvent {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    email: string;
    name: string;
    phone: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}

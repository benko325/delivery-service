import { IEvent } from "@nestjs/cqrs";

export class CustomerUpdatedEvent implements IEvent {
  public readonly id: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    phone: string;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
  }
}

import { IEvent } from "@nestjs/cqrs";
import { UserRole } from "../../../shared-kernel/core/types/user-types";

export class UserRegisteredEvent implements IEvent {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly roles: UserRole[];
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    email: string;
    name: string;
    phone: string;
    roles: UserRole[];
    createdAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.roles = data.roles;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}

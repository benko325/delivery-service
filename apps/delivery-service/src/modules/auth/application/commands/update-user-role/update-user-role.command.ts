import { ICommand } from "@nestjs/cqrs";
import { UserRole } from "../../../../shared-kernel/core/types/user-types";

export class UpdateUserRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly role: UserRole,
  ) {}
}

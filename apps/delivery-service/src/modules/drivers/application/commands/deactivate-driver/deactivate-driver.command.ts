import { ICommand } from "@nestjs/cqrs";

export class DeactivateDriverCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly actorUserId: string,
    public readonly actorRole: "admin" | "driver",
  ) {}
}

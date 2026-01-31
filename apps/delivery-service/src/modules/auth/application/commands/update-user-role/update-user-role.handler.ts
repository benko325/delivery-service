import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { UpdateUserRoleCommand } from "./update-user-role.command";
import { IAuthRepository } from "../../../core/repositories/auth.repository.interface";

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleCommandHandler implements ICommandHandler<UpdateUserRoleCommand> {
  constructor(
    @Inject("IAuthRepository")
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<{ success: true }> {
    const user = await this.authRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.authRepository.updateRole(command.userId, [command.role]);

    return { success: true };
  }
}

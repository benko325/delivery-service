import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { DeactivateDriverCommand } from "./deactivate-driver.command";
import { IDriverAggregateRepository } from "../../../core/repositories/driver.repository.interface";

@CommandHandler(DeactivateDriverCommand)
export class DeactivateDriverCommandHandler
  implements ICommandHandler<DeactivateDriverCommand>
{
  constructor(
    @Inject("IDriverAggregateRepository")
    private readonly driverAggregateRepository: IDriverAggregateRepository,
  ) {
    if (!this.driverAggregateRepository) {
      throw new InternalServerErrorException(
        "IDriverAggregateRepository provider is not available",
      );
    }
  }

  async execute(command: DeactivateDriverCommand): Promise<{ id: string }> {
    if (!command?.id) {
      throw new InternalServerErrorException(
        "Missing driver id in DeactivateDriverCommand",
      );
    }

    const target = await this.driverAggregateRepository.findById(command.id);
    if (!target) {
      throw new NotFoundException(`Driver ${command.id} not found`);
    }

    if (
      command.actorRole === "driver" &&
      target.userId !== command.actorUserId
    ) {
      throw new ForbiddenException(
        "Drivers can only deactivate their own account",
      );
    }

    try {
      await this.driverAggregateRepository.update(target.id, {
        isActive: false,
        updatedAt: new Date(),
      });
    } catch (err: unknown) {
       
      if (err instanceof Error) {
        console.error("[DeactivateDriverCommandHandler] update failed", err);
      } else {
        console.error(
          "[DeactivateDriverCommandHandler] update failed",
          String(err),
        );
      }
      throw new InternalServerErrorException("Failed to deactivate driver");
    }

    return { id: target.id };
  }
}

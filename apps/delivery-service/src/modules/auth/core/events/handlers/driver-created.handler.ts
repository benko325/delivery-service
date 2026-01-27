import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { DriverCreatedEvent } from "../../../../drivers/core/events/driver-created.event";

// small local typings to avoid `any`
interface AuthUser {
  id: string;
  roles?: string[];
  // other fields if needed
}

interface IAuthRepository {
  findById(id: string): Promise<AuthUser | null>;
  addRole(id: string, role: string): Promise<unknown>;
}

@EventsHandler(DriverCreatedEvent)
export class DriverCreatedHandler implements IEventHandler<DriverCreatedEvent> {
  private readonly logger = new Logger(DriverCreatedHandler.name);

  constructor(
    @Inject("IAuthRepository") private readonly userRepository: IAuthRepository,
  ) {}

  async handle(event: DriverCreatedEvent) {
    const userId = event.userId;
    if (!userId) {
      this.logger.warn("DriverCreatedEvent received with no userId");
      return;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `No user found for id=${userId}; cannot add 'driver' role`,
      );
      return;
    }

    if (user.roles?.includes("driver")) {
      this.logger.debug(`User ${userId} already has 'driver' role`);
      return;
    }

    await this.userRepository.addRole(userId, "driver");
    this.logger.debug(`Role 'driver' added for user ${userId}`);
  }
}

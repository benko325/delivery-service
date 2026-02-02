import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { UserRegisteredEvent } from "../../../auth/core/events/user-registered.event";
import { CreateCustomerCommand } from "../../application/commands/create-customer/create-customer.command";

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredAcl implements IEventHandler<UserRegisteredEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(UserRegisteredAcl.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.info(
      `[ACL] Handling UserRegisteredEvent for user: ${event.email}`,
    );

    // Anti-corruption layer: Map Auth domain event to Customers domain command
    // Only create customer if user has customer role
    if (event.roles.includes("customer")) {
      await this.commandBus.execute(
        new CreateCustomerCommand(
          event.id,
          event.email,
          event.name,
          event.phone,
        ),
      );
      this.logger.info(`[ACL] Customer created for user: ${event.email}`);
    }
  }
}

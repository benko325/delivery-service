import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { UserRegisteredEvent } from "../../../auth/core/events/user-registered.event";
import { CreateCustomerCommand } from "../../application/commands/create-customer/create-customer.command";

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredAcl implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredAcl.name);

  constructor(private readonly commandBus: CommandBus) {
    // Copilot: Debug - Overenie, či sa ACL handler načíta
    console.log("[ACL DEBUG] UserRegisteredAcl handler initialized!");
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    // Copilot: Debug - Overenie, či sa event dostane do handlera
    console.log("[ACL DEBUG] handle() called for event:", event);
    this.logger.log(
      `[ACL] Handling UserRegisteredEvent for user: ${event.email}`,
    );

    // Anti-corruption layer: Map Auth domain event to Customers domain command
    // Only create customer if user has customer role
    if (event.roles.includes("customer")) {
      console.log("[ACL DEBUG] Creating customer for:", event.email);
      await this.commandBus.execute(
        new CreateCustomerCommand(
          event.id,
          event.email,
          event.name,
          event.phone,
        ),
      );
      this.logger.log(`[ACL] Customer created for user: ${event.email}`);
    }
  }
}

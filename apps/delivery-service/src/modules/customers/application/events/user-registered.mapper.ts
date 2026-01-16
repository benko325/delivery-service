import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserRegisteredEvent } from '../../../auth/core/events/user-registered.event';
import { CreateCustomerCommand } from '../commands/create-customer/create-customer.command';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
    private readonly logger = new Logger(UserRegisteredEventHandler.name);

    constructor(private readonly commandBus: CommandBus) {}

    async handle(event: UserRegisteredEvent): Promise<void> {
        this.logger.log(`Handling UserRegisteredEvent for user: ${event.email}`);

        // Anti-corruption layer: Map Auth domain event to Customers domain command
        // Only create customer if user has customer role
        if (event.roles.includes('customer')) {
            await this.commandBus.execute(
                new CreateCustomerCommand(event.id, event.email, event.name, event.phone),
            );
            this.logger.log(`Customer created for user: ${event.email}`);
        }
    }
}

import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { RegisterCommand } from './register.command';
import { IAuthRepository } from '../../../core/repositories/auth.repository.interface';
import { AuthAggregate } from '../../../core/aggregates/auth.aggregate';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @Inject('IAuthRepository')
        private readonly authRepository: IAuthRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: RegisterCommand): Promise<{ id: string; email: string }> {
        const existingUser = await this.authRepository.findByEmail(command.email);

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const authAggregate = this.publisher.mergeObjectContext(new AuthAggregate());

        await authAggregate.register(
            command.email,
            command.password,
            command.name,
            command.phone,
            ['customer'],
        );

        await this.authRepository.create({
            id: authAggregate.id,
            email: authAggregate.email,
            password: authAggregate.password,
            roles: authAggregate.roles,
        });

        authAggregate.commit();

        return {
            id: authAggregate.id,
            email: authAggregate.email,
        };
    }
}

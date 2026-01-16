import { IEvent } from '@nestjs/cqrs';
import { UserRole } from '../../../shared-kernel/core/types/user-types';

export class UserRegisteredEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        public readonly phone: string,
        public readonly roles: UserRole[],
        public readonly createdAt: Date,
    ) {}
}

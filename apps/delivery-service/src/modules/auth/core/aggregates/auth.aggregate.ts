import { AggregateRoot } from '@nestjs/cqrs';
import { UserRole } from '../../../shared-kernel/core/types/user-types';
import { UserRegisteredEvent } from '../events/user-registered.event';
import * as crypto from 'crypto';

export class AuthAggregate extends AggregateRoot {
    private _id: string = '';
    private _email: string = '';
    private _password: string = '';
    private _roles: UserRole[] = [];
    private _refreshToken: string | null = null;
    private _createdAt: Date = new Date();
    private _updatedAt: Date = new Date();

    get id(): string {
        return this._id;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    get roles(): UserRole[] {
        return this._roles;
    }

    get refreshToken(): string | null {
        return this._refreshToken;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    async register(
        email: string,
        password: string,
        name: string,
        phone: string,
        roles: UserRole[] = ['customer'],
    ): Promise<void> {
        this._id = crypto.randomUUID();
        this._email = email.toLowerCase();
        this._password = await this.hashPassword(password);
        this._roles = roles;
        this._createdAt = new Date();
        this._updatedAt = new Date();

        this.apply(
            new UserRegisteredEvent(
                this._id,
                this._email,
                name,
                phone,
                this._roles,
                this._createdAt,
            ),
        );
    }

    async validatePassword(plainPassword: string): Promise<boolean> {
        const [salt, storedHash] = this._password.split(':');
        const hash = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
        return hash === storedHash;
    }

    setRefreshToken(token: string | null): void {
        this._refreshToken = token;
        this._updatedAt = new Date();
    }

    loadState(data: {
        id: string;
        email: string;
        password: string;
        roles: UserRole[];
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): void {
        this._id = data.id;
        this._email = data.email;
        this._password = data.password;
        this._roles = data.roles;
        this._refreshToken = data.refreshToken;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }
}

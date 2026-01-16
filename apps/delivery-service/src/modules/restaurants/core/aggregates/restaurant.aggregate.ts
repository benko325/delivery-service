import { AggregateRoot } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { RestaurantAddress } from '../types/restaurant-database.types';
import { RestaurantCreatedEvent } from '../events/restaurant-created.event';

export class RestaurantAggregate extends AggregateRoot {
    private _id: string = '';
    private _ownerId: string = '';
    private _name: string = '';
    private _description: string = '';
    private _address: RestaurantAddress = { street: '', city: '', postalCode: '', country: '' };
    private _phone: string = '';
    private _email: string = '';
    private _isActive: boolean = true;
    private _openingHours: Record<string, { open: string; close: string }> = {};
    private _createdAt: Date = new Date();
    private _updatedAt: Date = new Date();

    get id(): string {
        return this._id;
    }

    get ownerId(): string {
        return this._ownerId;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get address(): RestaurantAddress {
        return this._address;
    }

    get phone(): string {
        return this._phone;
    }

    get email(): string {
        return this._email;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get openingHours(): Record<string, { open: string; close: string }> {
        return this._openingHours;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    create(
        ownerId: string,
        name: string,
        description: string,
        address: RestaurantAddress,
        phone: string,
        email: string,
        openingHours: Record<string, { open: string; close: string }>,
    ): void {
        this._id = crypto.randomUUID();
        this._ownerId = ownerId;
        this._name = name;
        this._description = description;
        this._address = address;
        this._phone = phone;
        this._email = email.toLowerCase();
        this._isActive = true;
        this._openingHours = openingHours;
        this._createdAt = new Date();
        this._updatedAt = new Date();

        this.apply(
            new RestaurantCreatedEvent(
                this._id,
                this._ownerId,
                this._name,
                this._address,
                this._createdAt,
            ),
        );
    }

    update(
        name: string,
        description: string,
        address: RestaurantAddress,
        phone: string,
        email: string,
        openingHours: Record<string, { open: string; close: string }>,
    ): void {
        this._name = name;
        this._description = description;
        this._address = address;
        this._phone = phone;
        this._email = email.toLowerCase();
        this._openingHours = openingHours;
        this._updatedAt = new Date();
    }

    activate(): void {
        this._isActive = true;
        this._updatedAt = new Date();
    }

    deactivate(): void {
        this._isActive = false;
        this._updatedAt = new Date();
    }

    loadState(data: {
        id: string;
        ownerId: string;
        name: string;
        description: string;
        address: RestaurantAddress;
        phone: string;
        email: string;
        isActive: boolean;
        openingHours: Record<string, { open: string; close: string }>;
        createdAt: Date;
        updatedAt: Date;
    }): void {
        this._id = data.id;
        this._ownerId = data.ownerId;
        this._name = data.name;
        this._description = data.description;
        this._address = data.address;
        this._phone = data.phone;
        this._email = data.email;
        this._isActive = data.isActive;
        this._openingHours = data.openingHours;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }
}

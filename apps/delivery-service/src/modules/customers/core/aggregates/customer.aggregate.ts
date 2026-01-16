import { AggregateRoot } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { CustomerAddress } from '../types/customer-database.types';
import { CustomerCreatedEvent } from '../events/customer-created.event';
import { CustomerUpdatedEvent } from '../events/customer-updated.event';
import { CustomerAddressUpdatedEvent } from '../events/customer-address-updated.event';

export class CustomerAggregate extends AggregateRoot {
    private _id: string = '';
    private _email: string = '';
    private _name: string = '';
    private _phone: string = '';
    private _address: CustomerAddress | null = null;
    private _createdAt: Date = new Date();
    private _updatedAt: Date = new Date();

    get id(): string {
        return this._id;
    }

    get email(): string {
        return this._email;
    }

    get name(): string {
        return this._name;
    }

    get phone(): string {
        return this._phone;
    }

    get address(): CustomerAddress | null {
        return this._address;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    create(id: string | null, email: string, name: string, phone: string): void {
        this._id = id || crypto.randomUUID();
        this._email = email.toLowerCase();
        this._name = name;
        this._phone = phone;
        this._createdAt = new Date();
        this._updatedAt = new Date();

        this.apply(
            new CustomerCreatedEvent(
                this._id,
                this._email,
                this._name,
                this._phone,
                this._createdAt,
            ),
        );
    }

    update(name: string, phone: string): void {
        this._name = name;
        this._phone = phone;
        this._updatedAt = new Date();

        this.apply(
            new CustomerUpdatedEvent(this._id, this._name, this._phone, this._updatedAt),
        );
    }

    updateAddress(address: CustomerAddress): void {
        this._address = address;
        this._updatedAt = new Date();

        this.apply(
            new CustomerAddressUpdatedEvent(this._id, this._address, this._updatedAt),
        );
    }

    loadState(data: {
        id: string;
        email: string;
        name: string;
        phone: string;
        address: CustomerAddress | null;
        createdAt: Date;
        updatedAt: Date;
    }): void {
        this._id = data.id;
        this._email = data.email;
        this._name = data.name;
        this._phone = data.phone;
        this._address = data.address;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }
}

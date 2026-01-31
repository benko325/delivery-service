import { AggregateRoot } from "@nestjs/cqrs";
import * as crypto from "crypto";
import { CustomerAddress } from "../types/customer-database.types";
import { CustomerCreatedEvent } from "../events/customer-created.event";
import { CustomerUpdatedEvent } from "../events/customer-updated.event";
import { CustomerAddressAddedEvent } from "../events/customer-address-added.event";
import { CustomerAddressRemovedEvent } from "../events/customer-address-removed.event";
import { RestaurantAddedToFavoritesEvent } from "../events/restaurant-added-to-favorites.event";
import { RestaurantRemovedFromFavoritesEvent } from "../events/restaurant-removed-from-favorites.event";

export class CustomerAggregate extends AggregateRoot {
  private _id: string = "";
  private _email: string = "";
  private _name: string = "";
  private _phone: string = "";
  private _addresses: CustomerAddress[] = [];
  private _favoriteRestaurantIds: string[] = [];
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

  get addresses(): CustomerAddress[] {
    return this._addresses;
  }

  get favoriteRestaurantIds(): string[] {
    return this._favoriteRestaurantIds;
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
      new CustomerCreatedEvent({
        id: this._id,
        email: this._email,
        name: this._name,
        phone: this._phone,
        createdAt: this._createdAt,
      }),
    );
  }

  update(name: string, phone: string): void {
    this._name = name;
    this._phone = phone;
    this._updatedAt = new Date();

    this.apply(
      new CustomerUpdatedEvent({
        id: this._id,
        name: this._name,
        phone: this._phone,
        updatedAt: this._updatedAt,
      }),
    );
  }

  addAddress(address: Omit<CustomerAddress, "id"> & { id?: string }): void {
    const addressWithId: CustomerAddress = {
      ...address,
      id: address.id || crypto.randomUUID(),
    };

    this._addresses.push(addressWithId);
    this._updatedAt = new Date();
    this.apply(
      new CustomerAddressAddedEvent({
        id: this._id,
        address: addressWithId,
        updatedAt: this._updatedAt,
      }),
    );
  }

  removeAddress(addressId: string): void {
    this._addresses = this._addresses.filter((a) => a.id !== addressId);
    this._updatedAt = new Date();
    this.apply(
      new CustomerAddressRemovedEvent({
        id: this._id,
        addressId,
        updatedAt: this._updatedAt,
      }),
    );
  }

  addFavoriteRestaurant(restaurantId: string): void {
    if (!this._favoriteRestaurantIds.includes(restaurantId)) {
      this._favoriteRestaurantIds.push(restaurantId);
      this._updatedAt = new Date();
      this.apply(
        new RestaurantAddedToFavoritesEvent({
          id: this._id,
          restaurantId,
          updatedAt: this._updatedAt,
        }),
      );
    }
  }

  removeFavoriteRestaurant(restaurantId: string): void {
    this._favoriteRestaurantIds = this._favoriteRestaurantIds.filter(
      (id) => id !== restaurantId,
    );
    this._updatedAt = new Date();
    this.apply(
      new RestaurantRemovedFromFavoritesEvent({
        id: this._id,
        restaurantId,
        updatedAt: this._updatedAt,
      }),
    );
  }

  loadState(data: {
    id: string;
    email: string;
    name: string;
    phone: string;
    addresses: CustomerAddress[] | null;
    favoriteRestaurantIds: string[] | null;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = data.id;
    this._email = data.email;
    this._name = data.name;
    this._phone = data.phone;
    this._addresses = data.addresses || [];
    this._favoriteRestaurantIds = data.favoriteRestaurantIds || [];
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }
}

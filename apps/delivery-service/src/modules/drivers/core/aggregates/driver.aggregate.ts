import { AggregateRoot } from "@nestjs/cqrs";
import * as crypto from "crypto";
import { DriverStatus, DriverLocation } from "../types/driver-database.types";
import { DriverCreatedEvent } from "../events/driver-created.event";
import { DriverAvailabilityChangedEvent } from "../events/driver-availability-changed.event";
import { DriverLocationUpdatedEvent } from "../events/driver-location-updated.event";

export class DriverAggregate extends AggregateRoot {
  private _id: string = "";
  private _userId: string = "";
  private _name: string = "";
  private _email: string = "";
  private _phone: string = "";
  private _vehicleType: string = "";
  private _licensePlate: string = "";
  private _status: DriverStatus = "offline";
  private _currentLocation: DriverLocation | null = null;
  private _rating: number = 5.0;
  private _totalDeliveries: number = 0;
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get vehicleType(): string {
    return this._vehicleType;
  }

  get licensePlate(): string {
    return this._licensePlate;
  }

  get status(): DriverStatus {
    return this._status;
  }

  get currentLocation(): DriverLocation | null {
    return this._currentLocation;
  }

  get rating(): number {
    return this._rating;
  }

  get totalDeliveries(): number {
    return this._totalDeliveries;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  create(
    userId: string,
    name: string,
    email: string,
    phone: string,
    vehicleType: string,
    licensePlate: string,
  ): void {
    this._id = crypto.randomUUID();
    this._userId = userId;
    this._name = name;
    this._email = email.toLowerCase();
    this._phone = phone;
    this._vehicleType = vehicleType;
    this._licensePlate = licensePlate.toUpperCase();
    this._status = "offline";
    this._rating = 5.0;
    this._totalDeliveries = 0;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.apply(
      new DriverCreatedEvent({
        id: this._id,
        userId: this._userId,
        name: this._name,
        email: this._email,
        createdAt: this._createdAt,
      }),
    );
  }

  update(
    name: string,
    phone: string,
    vehicleType: string,
    licensePlate: string,
  ): void {
    this._name = name;
    this._phone = phone;
    this._vehicleType = vehicleType;
    this._licensePlate = licensePlate.toUpperCase();
    this._updatedAt = new Date();
  }

  setAvailability(status: DriverStatus): void {
    const previousStatus = this._status;
    this._status = status;
    this._updatedAt = new Date();

    this.apply(
      new DriverAvailabilityChangedEvent({
        id: this._id,
        previousStatus,
        newStatus: status,
        changedAt: this._updatedAt,
      }),
    );
  }

  updateLocation(latitude: number, longitude: number): void {
    this._currentLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };
    this._updatedAt = new Date();

    this.apply(
      new DriverLocationUpdatedEvent({
        id: this._id,
        location: this._currentLocation,
        updatedAt: this._updatedAt,
      }),
    );
  }

  completeDelivery(newRating: number): void {
    this._totalDeliveries += 1;
    // Calculate new average rating
    this._rating =
      (this._rating * (this._totalDeliveries - 1) + newRating) /
      this._totalDeliveries;
    this._updatedAt = new Date();
  }

  loadState(data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    vehicleType: string;
    licensePlate: string;
    status: DriverStatus;
    currentLocation: DriverLocation | null;
    rating: number;
    totalDeliveries: number;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = data.id;
    this._userId = data.userId;
    this._name = data.name;
    this._email = data.email;
    this._phone = data.phone;
    this._vehicleType = data.vehicleType;
    this._licensePlate = data.licensePlate;
    this._status = data.status;
    this._currentLocation = data.currentLocation;
    this._rating = data.rating;
    this._totalDeliveries = data.totalDeliveries;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }
}

import { AggregateRoot } from "@nestjs/cqrs";
import * as crypto from "crypto";
import { MenuItemCategory } from "../types/restaurant-database.types";
import { MenuItemCreatedEvent } from "../events/menu-item-created.event";

export class MenuItemAggregate extends AggregateRoot {
  private _id: string = "";
  private _restaurantId: string = "";
  private _name: string = "";
  private _description: string = "";
  private _price: number = 0;
  private _currency: string = "EUR";
  private _category: MenuItemCategory = "main_course";
  private _imageUrl: string | null = null;
  private _isAvailable: boolean = true;
  private _preparationTime: number = 15;
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  get id(): string {
    return this._id;
  }

  get restaurantId(): string {
    return this._restaurantId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get currency(): string {
    return this._currency;
  }

  get category(): MenuItemCategory {
    return this._category;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get preparationTime(): number {
    return this._preparationTime;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  create(
    restaurantId: string,
    name: string,
    description: string,
    price: number,
    currency: string,
    category: MenuItemCategory,
    imageUrl: string | null,
    preparationTime: number,
  ): void {
    this._id = crypto.randomUUID();
    this._restaurantId = restaurantId;
    this._name = name;
    this._description = description;
    this._price = price;
    this._currency = currency;
    this._category = category;
    this._imageUrl = imageUrl;
    this._isAvailable = true;
    this._preparationTime = preparationTime;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.apply(
      new MenuItemCreatedEvent({
        id: this._id,
        restaurantId: this._restaurantId,
        name: this._name,
        price: this._price,
        category: this._category,
        createdAt: this._createdAt,
      }),
    );
  }

  update(
    name: string,
    description: string,
    price: number,
    currency: string,
    category: MenuItemCategory,
    imageUrl: string | null,
    preparationTime: number,
    isAvailable: boolean,
  ): void {
    this._name = name;
    this._description = description;
    this._price = price;
    this._currency = currency;
    this._category = category;
    this._imageUrl = imageUrl;
    this._preparationTime = preparationTime;
    this._isAvailable = isAvailable;
    this._updatedAt = new Date();
  }

  setAvailable(available: boolean): void {
    this._isAvailable = available;
    this._updatedAt = new Date();
  }

  loadState(data: {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: MenuItemCategory;
    imageUrl: string | null;
    isAvailable: boolean;
    preparationTime: number;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = data.id;
    this._restaurantId = data.restaurantId;
    this._name = data.name;
    this._description = data.description;
    this._price = data.price;
    this._currency = data.currency;
    this._category = data.category;
    this._imageUrl = data.imageUrl;
    this._isAvailable = data.isAvailable;
    this._preparationTime = data.preparationTime;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }
}

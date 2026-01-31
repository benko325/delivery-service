import { AggregateRoot } from "@nestjs/cqrs";
import * as crypto from "crypto";
import { CartItem } from "../types/cart-database.types";
import { DeliveryAddress } from "../types/delivery-address.types";
import { CartItemAddedEvent } from "../events/cart-item-added.event";
import { CartClearedEvent } from "../events/cart-cleared.event";
import { CartOrderedEvent } from "../events/cart-ordered.event";

export class CartAggregate extends AggregateRoot {
  private _id: string = "";
  private _customerId: string = "";
  private _restaurantId: string | null = null;
  private _items: CartItem[] = [];
  private _totalAmount: number = 0;
  private _currency: string = "EUR";
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get restaurantId(): string | null {
    return this._restaurantId;
  }

  get items(): CartItem[] {
    return this._items;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get currency(): string {
    return this._currency;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  create(customerId: string): void {
    this._id = crypto.randomUUID();
    this._customerId = customerId;
    this._items = [];
    this._totalAmount = 0;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  addItem(
    menuItemId: string,
    restaurantId: string,
    name: string,
    price: number,
    currency: string,
    quantity: number,
  ): void {
    // Check if cart already has items from a different restaurant
    if (this._restaurantId && this._restaurantId !== restaurantId) {
      throw new Error(
        "Cannot add items from different restaurants to the same cart",
      );
    }

    this._restaurantId = restaurantId;
    this._currency = currency;

    // Check if item already exists in cart
    const existingItem = this._items.find(
      (item) => item.menuItemId === menuItemId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this._items.push({
        menuItemId,
        restaurantId,
        name,
        price,
        currency,
        quantity,
      });
    }

    this.recalculateTotal();
    this._updatedAt = new Date();

    this.apply(
      new CartItemAddedEvent({
        cartId: this._id,
        customerId: this._customerId,
        menuItemId,
        quantity,
        addedAt: this._updatedAt,
      }),
    );
  }

  removeItem(menuItemId: string): void {
    this._items = this._items.filter((item) => item.menuItemId !== menuItemId);

    if (this._items.length === 0) {
      this._restaurantId = null;
    }

    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  updateItemQuantity(menuItemId: string, quantity: number): void {
    const item = this._items.find((i) => i.menuItemId === menuItemId);

    if (!item) {
      throw new Error("Item not found in cart");
    }

    if (quantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }

    item.quantity = quantity;
    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  clear(): void {
    this._items = [];
    this._restaurantId = null;
    this._totalAmount = 0;
    this._updatedAt = new Date();

    this.apply(
      new CartClearedEvent({
        cartId: this._id,
        customerId: this._customerId,
        clearedAt: this._updatedAt,
      }),
    );
  }

  checkout(deliveryAddress: DeliveryAddress, deliveryFee: number): void {
    if (this._items.length === 0) {
      throw new Error("Cannot checkout an empty cart");
    }

    if (!this._restaurantId) {
      throw new Error("Cart has no restaurant");
    }

    this.apply(
      new CartOrderedEvent({
        cartId: this._id,
        customerId: this._customerId,
        restaurantId: this._restaurantId,
        items: this._items,
        totalAmount: this._totalAmount,
        currency: this._currency,
        deliveryAddress,
        deliveryFee,
        orderedAt: new Date(),
      }),
    );
  }

  private recalculateTotal(): void {
    this._totalAmount = this._items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  loadState(data: {
    id: string;
    customerId: string;
    restaurantId: string | null;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = data.id;
    this._customerId = data.customerId;
    this._restaurantId = data.restaurantId;
    this._items = data.items;
    this._totalAmount = data.totalAmount;
    this._currency = data.currency;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }
}

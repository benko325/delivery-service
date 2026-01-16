import { AggregateRoot } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { OrderStatus, OrderItem, DeliveryAddress } from '../types/order-database.types';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';
import { OrderAcceptedByDriverEvent } from '../events/order-accepted-by-driver.event';

export class OrderAggregate extends AggregateRoot {
    private _id: string = '';
    private _customerId: string = '';
    private _restaurantId: string = '';
    private _driverId: string | null = null;
    private _items: OrderItem[] = [];
    private _deliveryAddress: DeliveryAddress = { street: '', city: '', postalCode: '', country: '' };
    private _status: OrderStatus = 'pending';
    private _totalAmount: number = 0;
    private _deliveryFee: number = 0;
    private _currency: string = 'USD';
    private _estimatedDeliveryTime: Date | null = null;
    private _actualDeliveryTime: Date | null = null;
    private _cancelledAt: Date | null = null;
    private _cancellationReason: string | null = null;
    private _createdAt: Date = new Date();
    private _updatedAt: Date = new Date();

    get id(): string { return this._id; }
    get customerId(): string { return this._customerId; }
    get restaurantId(): string { return this._restaurantId; }
    get driverId(): string | null { return this._driverId; }
    get items(): OrderItem[] { return this._items; }
    get deliveryAddress(): DeliveryAddress { return this._deliveryAddress; }
    get status(): OrderStatus { return this._status; }
    get totalAmount(): number { return this._totalAmount; }
    get deliveryFee(): number { return this._deliveryFee; }
    get currency(): string { return this._currency; }
    get estimatedDeliveryTime(): Date | null { return this._estimatedDeliveryTime; }
    get actualDeliveryTime(): Date | null { return this._actualDeliveryTime; }
    get cancelledAt(): Date | null { return this._cancelledAt; }
    get cancellationReason(): string | null { return this._cancellationReason; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    create(
        customerId: string,
        restaurantId: string,
        items: OrderItem[],
        deliveryAddress: DeliveryAddress,
        totalAmount: number,
        deliveryFee: number,
        currency: string,
    ): void {
        this._id = crypto.randomUUID();
        this._customerId = customerId;
        this._restaurantId = restaurantId;
        this._items = items;
        this._deliveryAddress = deliveryAddress;
        this._status = 'pending';
        this._totalAmount = totalAmount;
        this._deliveryFee = deliveryFee;
        this._currency = currency;
        this._createdAt = new Date();
        this._updatedAt = new Date();

        this.apply(
            new OrderCreatedEvent(
                this._id,
                this._customerId,
                this._restaurantId,
                this._totalAmount,
                this._createdAt,
            ),
        );
    }

    acceptByDriver(driverId: string, estimatedDeliveryTime: Date): void {
        if (this._status !== 'ready_for_pickup') {
            throw new Error('Order must be ready for pickup to be accepted by a driver');
        }

        const previousStatus = this._status;
        this._driverId = driverId;
        this._status = 'driver_assigned';
        this._estimatedDeliveryTime = estimatedDeliveryTime;
        this._updatedAt = new Date();

        this.apply(new OrderAcceptedByDriverEvent(this._id, driverId, this._updatedAt));
        this.apply(
            new OrderStatusChangedEvent(this._id, previousStatus, this._status, this._updatedAt),
        );
    }

    updateStatus(newStatus: OrderStatus): void {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['preparing', 'cancelled'],
            preparing: ['ready_for_pickup', 'cancelled'],
            ready_for_pickup: ['driver_assigned', 'cancelled'],
            driver_assigned: ['picked_up', 'cancelled'],
            picked_up: ['in_transit'],
            in_transit: ['delivered'],
            delivered: [],
            cancelled: [],
        };

        if (!validTransitions[this._status].includes(newStatus)) {
            throw new Error(
                `Invalid status transition from ${this._status} to ${newStatus}`,
            );
        }

        const previousStatus = this._status;
        this._status = newStatus;
        this._updatedAt = new Date();

        if (newStatus === 'delivered') {
            this._actualDeliveryTime = this._updatedAt;
        }

        this.apply(
            new OrderStatusChangedEvent(this._id, previousStatus, newStatus, this._updatedAt),
        );
    }

    cancel(reason: string): void {
        const cancellableStatuses: OrderStatus[] = [
            'pending',
            'confirmed',
            'preparing',
            'ready_for_pickup',
            'driver_assigned',
        ];

        if (!cancellableStatuses.includes(this._status)) {
            throw new Error(`Order in status ${this._status} cannot be cancelled`);
        }

        const previousStatus = this._status;
        this._status = 'cancelled';
        this._cancelledAt = new Date();
        this._cancellationReason = reason;
        this._updatedAt = new Date();

        this.apply(
            new OrderStatusChangedEvent(this._id, previousStatus, 'cancelled', this._updatedAt),
        );
    }

    loadState(data: {
        id: string;
        customerId: string;
        restaurantId: string;
        driverId: string | null;
        items: OrderItem[];
        deliveryAddress: DeliveryAddress;
        status: OrderStatus;
        totalAmount: number;
        deliveryFee: number;
        currency: string;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): void {
        this._id = data.id;
        this._customerId = data.customerId;
        this._restaurantId = data.restaurantId;
        this._driverId = data.driverId;
        this._items = data.items;
        this._deliveryAddress = data.deliveryAddress;
        this._status = data.status;
        this._totalAmount = data.totalAmount;
        this._deliveryFee = data.deliveryFee;
        this._currency = data.currency;
        this._estimatedDeliveryTime = data.estimatedDeliveryTime;
        this._actualDeliveryTime = data.actualDeliveryTime;
        this._cancelledAt = data.cancelledAt;
        this._cancellationReason = data.cancellationReason;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }
}

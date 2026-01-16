import { OrderStatus, OrderItem, DeliveryAddress } from '../types/order-database.types';

export interface Order {
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
}

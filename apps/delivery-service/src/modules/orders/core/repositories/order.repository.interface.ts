import { Order } from '../entities/order.entity';
import { OrderStatus, OrderItem, DeliveryAddress } from '../types/order-database.types';

export interface IOrderRepository {
    findById(id: string): Promise<Order | null>;
    findByCustomerId(customerId: string): Promise<Order[]>;
    findByDriverId(driverId: string): Promise<Order[]>;
    findByStatus(status: OrderStatus): Promise<Order[]>;
    findAvailableForDrivers(): Promise<Order[]>;
}

export interface IOrderAggregateRepository {
    save(order: {
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
    }): Promise<void>;
    update(
        id: string,
        data: Partial<{
            driverId: string | null;
            status: OrderStatus;
            estimatedDeliveryTime: Date | null;
            actualDeliveryTime: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            updatedAt: Date;
        }>,
    ): Promise<void>;
    findById(id: string): Promise<Order | null>;
}

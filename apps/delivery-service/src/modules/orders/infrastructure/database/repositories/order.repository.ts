import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { IOrderRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';
import { OrderDatabase, OrderStatus } from '../../../core/types/order-database.types';

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<OrderDatabase>,
    ) {}

    async findById(id: string): Promise<Order | null> {
        const order = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return order ? this.mapToOrder(order) : null;
    }

    async findByCustomerId(customerId: string): Promise<Order[]> {
        const orders = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('customerId', '=', customerId)
            .orderBy('createdAt', 'desc')
            .execute();

        return orders.map((o) => this.mapToOrder(o));
    }

    async findByDriverId(driverId: string): Promise<Order[]> {
        const orders = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('driverId', '=', driverId)
            .orderBy('createdAt', 'desc')
            .execute();

        return orders.map((o) => this.mapToOrder(o));
    }

    async findByStatus(status: OrderStatus): Promise<Order[]> {
        const orders = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('status', '=', status)
            .orderBy('createdAt', 'asc')
            .execute();

        return orders.map((o) => this.mapToOrder(o));
    }

    async findAvailableForDrivers(): Promise<Order[]> {
        const orders = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('status', '=', 'ready_for_pickup')
            .where('driverId', 'is', null)
            .orderBy('createdAt', 'asc')
            .execute();

        return orders.map((o) => this.mapToOrder(o));
    }

    private mapToOrder(row: unknown): Order {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            customerId: data.customerId as string,
            restaurantId: data.restaurantId as string,
            driverId: data.driverId as string | null,
            items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
            deliveryAddress:
                typeof data.deliveryAddress === 'string'
                    ? JSON.parse(data.deliveryAddress)
                    : data.deliveryAddress,
            status: data.status as OrderStatus,
            totalAmount: data.totalAmount as number,
            deliveryFee: data.deliveryFee as number,
            currency: data.currency as string,
            estimatedDeliveryTime: data.estimatedDeliveryTime
                ? new Date(data.estimatedDeliveryTime as string)
                : null,
            actualDeliveryTime: data.actualDeliveryTime
                ? new Date(data.actualDeliveryTime as string)
                : null,
            cancelledAt: data.cancelledAt ? new Date(data.cancelledAt as string) : null,
            cancellationReason: data.cancellationReason as string | null,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

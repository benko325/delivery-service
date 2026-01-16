import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { IOrderAggregateRepository } from '../../../core/repositories/order.repository.interface';
import { Order } from '../../../core/entities/order.entity';
import { OrderDatabase, OrderStatus, OrderItem, DeliveryAddress } from '../../../core/types/order-database.types';

@Injectable()
export class OrderAggregateRepository implements IOrderAggregateRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<OrderDatabase>,
    ) {}

    async save(order: {
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
    }): Promise<void> {
        await this.db
            .insertInto('orders.orders')
            .values({
                id: order.id,
                customerId: order.customerId,
                restaurantId: order.restaurantId,
                driverId: order.driverId,
                items: sql`${JSON.stringify(order.items)}::jsonb`,
                deliveryAddress: sql`${JSON.stringify(order.deliveryAddress)}::jsonb`,
                status: order.status,
                totalAmount: order.totalAmount,
                deliveryFee: order.deliveryFee,
                currency: order.currency,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                actualDeliveryTime: order.actualDeliveryTime,
                cancelledAt: order.cancelledAt,
                cancellationReason: order.cancellationReason,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            } as never)
            .execute();
    }

    async update(
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
    ): Promise<void> {
        const updateData: Record<string, unknown> = {};

        if (data.driverId !== undefined) updateData.driverId = data.driverId;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.estimatedDeliveryTime !== undefined)
            updateData.estimatedDeliveryTime = data.estimatedDeliveryTime;
        if (data.actualDeliveryTime !== undefined)
            updateData.actualDeliveryTime = data.actualDeliveryTime;
        if (data.cancelledAt !== undefined) updateData.cancelledAt = data.cancelledAt;
        if (data.cancellationReason !== undefined)
            updateData.cancellationReason = data.cancellationReason;
        if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

        await this.db
            .updateTable('orders.orders')
            .set(updateData as never)
            .where('id', '=', id)
            .execute();
    }

    async findById(id: string): Promise<Order | null> {
        const order = await this.db
            .selectFrom('orders.orders')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return order ? this.mapToOrder(order) : null;
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

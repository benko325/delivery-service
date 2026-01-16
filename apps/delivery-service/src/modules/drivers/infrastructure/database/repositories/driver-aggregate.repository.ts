import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { IDriverAggregateRepository } from '../../../core/repositories/driver.repository.interface';
import { Driver } from '../../../core/entities/driver.entity';
import { DriverDatabase, DriverStatus, DriverLocation } from '../../../core/types/driver-database.types';

@Injectable()
export class DriverAggregateRepository implements IDriverAggregateRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<DriverDatabase>,
    ) {}

    async save(driver: {
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
    }): Promise<void> {
        await this.db
            .insertInto('drivers.drivers')
            .values({
                id: driver.id,
                userId: driver.userId,
                name: driver.name,
                email: driver.email.toLowerCase(),
                phone: driver.phone,
                vehicleType: driver.vehicleType,
                licensePlate: driver.licensePlate.toUpperCase(),
                status: driver.status,
                currentLocation: driver.currentLocation
                    ? sql`${JSON.stringify(driver.currentLocation)}::jsonb`
                    : null,
                rating: driver.rating,
                totalDeliveries: driver.totalDeliveries,
                createdAt: driver.createdAt,
                updatedAt: driver.updatedAt,
            } as never)
            .execute();
    }

    async update(
        id: string,
        data: Partial<{
            name: string;
            phone: string;
            vehicleType: string;
            licensePlate: string;
            status: DriverStatus;
            currentLocation: DriverLocation | null;
            rating: number;
            totalDeliveries: number;
            updatedAt: Date;
        }>,
    ): Promise<void> {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
        if (data.licensePlate !== undefined)
            updateData.licensePlate = data.licensePlate.toUpperCase();
        if (data.status !== undefined) updateData.status = data.status;
        if (data.currentLocation !== undefined) {
            updateData.currentLocation = data.currentLocation
                ? sql`${JSON.stringify(data.currentLocation)}::jsonb`
                : null;
        }
        if (data.rating !== undefined) updateData.rating = data.rating;
        if (data.totalDeliveries !== undefined) updateData.totalDeliveries = data.totalDeliveries;
        if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

        await this.db
            .updateTable('drivers.drivers')
            .set(updateData as never)
            .where('id', '=', id)
            .execute();
    }

    async findById(id: string): Promise<Driver | null> {
        const driver = await this.db
            .selectFrom('drivers.drivers')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return driver ? this.mapToDriver(driver) : null;
    }

    private mapToDriver(row: unknown): Driver {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            userId: data.userId as string,
            name: data.name as string,
            email: data.email as string,
            phone: data.phone as string,
            vehicleType: data.vehicleType as string,
            licensePlate: data.licensePlate as string,
            status: data.status as Driver['status'],
            currentLocation: data.currentLocation
                ? typeof data.currentLocation === 'string'
                    ? JSON.parse(data.currentLocation)
                    : data.currentLocation
                : null,
            rating: data.rating as number,
            totalDeliveries: data.totalDeliveries as number,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

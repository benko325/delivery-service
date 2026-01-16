import { Driver } from '../entities/driver.entity';
import { DriverStatus, DriverLocation } from '../types/driver-database.types';

export interface IDriverRepository {
    findById(id: string): Promise<Driver | null>;
    findByUserId(userId: string): Promise<Driver | null>;
    findAll(): Promise<Driver[]>;
    findAvailable(): Promise<Driver[]>;
}

export interface IDriverAggregateRepository {
    save(driver: {
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
    }): Promise<void>;
    update(
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
    ): Promise<void>;
    findById(id: string): Promise<Driver | null>;
}

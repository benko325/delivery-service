import { Driver } from "../entities/driver.entity";
import { DriverAggregate } from "../aggregates/driver.aggregate";
import { DriverStatus, DriverLocation } from "../types/driver-database.types";

export interface IDriverRepository {
  findById(id: string): Promise<Driver | null>;
  findByUserId(userId: string): Promise<Driver | null>;
  findAll(): Promise<Driver[]>;
  findAvailable(): Promise<Driver[]>;
}

export interface IDriverAggregateRepository {
  save(driver: DriverAggregate): Promise<void>;
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
      isActive: boolean;
      updatedAt: Date;
    }>,
  ): Promise<void>;
  findById(id: string): Promise<DriverAggregate | null>;
}

import { Injectable, Inject } from "@nestjs/common";
import { Kysely } from "kysely";
import { IDriverRepository } from "../../../core/repositories/driver.repository.interface";
import { Driver } from "../../../core/entities/driver.entity";
import { DriverDatabase } from "../../../core/types/driver-database.types";

@Injectable()
export class DriverRepository implements IDriverRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private readonly db: Kysely<DriverDatabase>,
  ) {}

  async findById(id: string): Promise<Driver | null> {
    const driver = await this.db
      .selectFrom("drivers.drivers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return driver ? this.mapToDriver(driver) : null;
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    const driver = await this.db
      .selectFrom("drivers.drivers")
      .selectAll()
      .where("userId", "=", userId)
      .executeTakeFirst();

    return driver ? this.mapToDriver(driver) : null;
  }

  async findAll(): Promise<Driver[]> {
    const drivers = await this.db
      .selectFrom("drivers.drivers")
      .selectAll()
      .orderBy("name", "asc")
      .execute();

    return drivers.map((d) => this.mapToDriver(d));
  }

  async findAvailable(): Promise<Driver[]> {
    const drivers = await this.db
      .selectFrom("drivers.drivers")
      .selectAll()
      .where("status", "=", "available")
      .where("isActive", "=", true)
      .orderBy("rating", "desc")
      .execute();

    return drivers.map((d) => this.mapToDriver(d));
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
      status: data.status as Driver["status"],
      currentLocation: data.currentLocation
        ? typeof data.currentLocation === "string"
          ? JSON.parse(data.currentLocation)
          : data.currentLocation
        : null,
      rating: data.rating as number,
      totalDeliveries: data.totalDeliveries as number,
      isActive: (data.isActive as boolean) ?? true,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }
}

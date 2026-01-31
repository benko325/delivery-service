import { Injectable, Inject } from "@nestjs/common";
import { Kysely, sql } from "kysely";
import { IDriverAggregateRepository } from "../../../core/repositories/driver.repository.interface";
import { Driver } from "../../../core/entities/driver.entity";
import { DriverAggregate } from "../../../core/aggregates/driver.aggregate";
import {
  DriverDatabase,
  DriverStatus,
  DriverLocation,
} from "../../../core/types/driver-database.types";

@Injectable()
export class DriverAggregateRepository implements IDriverAggregateRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private readonly db: Kysely<DriverDatabase>,
  ) {}

  async save(driver: DriverAggregate): Promise<void> {
    await this.db
      .insertInto("drivers.drivers")
      .values({
        id: driver.id,
        userId: driver.userId,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate.toUpperCase(),
        status: driver.status,
        currentLocation: driver.currentLocation
          ? sql`${JSON.stringify(driver.currentLocation)}::jsonb`
          : null,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        isActive: driver.isActive,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      } as never)
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          vehicleType: driver.vehicleType,
          licensePlate: driver.licensePlate.toUpperCase(),
          status: driver.status,
          currentLocation: driver.currentLocation
            ? sql`${JSON.stringify(driver.currentLocation)}::jsonb`
            : null,
          rating: driver.rating,
          totalDeliveries: driver.totalDeliveries,
          isActive: driver.isActive,
          updatedAt: driver.updatedAt,
        } as never),
      )
      .execute();
  }

  async update(
    id: string,
    data: Partial<{
      vehicleType: string;
      licensePlate: string;
      status: DriverStatus;
      currentLocation: DriverLocation | null;
      rating: number;
      totalDeliveries: number;
      isActive: boolean;
      updatedAt: Date;
    }>,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (data.vehicleType !== undefined)
      updateData.vehicleType = data.vehicleType;
    if (data.licensePlate !== undefined)
      updateData.licensePlate = data.licensePlate.toUpperCase();
    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentLocation !== undefined) {
      updateData.currentLocation = data.currentLocation
        ? sql`${JSON.stringify(data.currentLocation)}::jsonb`
        : null;
    }
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.totalDeliveries !== undefined)
      updateData.totalDeliveries = data.totalDeliveries;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

    await this.db
      .updateTable("drivers.drivers")
      .set(updateData as never)
      .where("id", "=", id)
      .execute();
  }

  async findById(id: string): Promise<DriverAggregate | null> {
    const driver = await this.db
      .selectFrom("drivers.drivers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return driver ? this.mapToAggregate(driver) : null;
  }

  private mapToAggregate(row: unknown): DriverAggregate {
    const data = row as Record<string, unknown>;
    const aggregate = new DriverAggregate();
    aggregate.loadState({
      id: data.id as string,
      userId: data.userId as string,
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
    });
    return aggregate;
  }
}

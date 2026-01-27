import { Generated } from "kysely";

export type DriverStatus = "available" | "busy" | "offline";

export interface DriverLocation {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export interface DriversTable {
  id: Generated<string>;
  userId: string;
  vehicleType: string;
  licensePlate: string;
  status: DriverStatus;
  currentLocation: DriverLocation | null;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface DriverDatabase {
  "drivers.drivers": DriversTable;
}

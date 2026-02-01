import { DriverStatus, DriverLocation } from "../types/driver-database.types";

export interface Driver {
  id: string;
  userId: string;
  vehicleType: string;
  licensePlate: string;
  status: DriverStatus;
  currentLocation: DriverLocation | null;
  currentOrderId: string | null;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

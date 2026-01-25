import { DriverStatus, DriverLocation } from "../types/driver-database.types";

export interface Driver {
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

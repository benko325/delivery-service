import { CustomerAddress } from "../types/customer-database.types";

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  addresses: CustomerAddress[];
  favoriteRestaurantIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

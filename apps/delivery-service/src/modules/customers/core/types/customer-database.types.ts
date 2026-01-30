import { Generated } from "kysely";

export interface CustomerAddress {
  id: string;
  label?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomersTable {
  id: Generated<string>;
  email: string;
  name: string;
  phone: string;
  addresses: CustomerAddress[] | null;
  favoriteRestaurantIds: string[] | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface CustomerDatabase {
  "customers.customers": CustomersTable;
}

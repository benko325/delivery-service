import { Customer } from "../entities/customer.entity";
import { CustomerAddress } from "../types/customer-database.types";

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}

export interface ICustomerAggregateRepository {
  save(customer: {
    id: string;
    email: string;
    name: string;
    phone: string;
    addresses: CustomerAddress[];
    favoriteRestaurantIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void>;
  update(
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      addresses: CustomerAddress[];
      favoriteRestaurantIds: string[];
      updatedAt: Date;
    }>,
  ): Promise<void>;
  findById(id: string): Promise<Customer | null>;
}

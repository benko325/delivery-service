import { Injectable, Inject } from "@nestjs/common";
import { Kysely, sql } from "kysely";
import { ICustomerAggregateRepository } from "../../../core/repositories/customer.repository.interface";
import { Customer } from "../../../core/entities/customer.entity";
import {
  CustomerDatabase,
  CustomerAddress,
} from "../../../core/types/customer-database.types";

@Injectable()
export class CustomerAggregateRepository implements ICustomerAggregateRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private readonly db: Kysely<CustomerDatabase>,
  ) {}

  async save(customer: {
    id: string;
    email: string;
    name: string;
    phone: string;
    addresses: CustomerAddress[];
    favoriteRestaurantIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    await this.db
      .insertInto("customers.customers")
      .values({
        id: customer.id,
        email: customer.email.toLowerCase(),
        name: customer.name,
        phone: customer.phone,
        addresses: sql`${JSON.stringify(customer.addresses)}::jsonb`,
        favoriteRestaurantIds: sql`${JSON.stringify(
          customer.favoriteRestaurantIds,
        )}::jsonb`,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      } as never)
      .execute();
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      addresses: CustomerAddress[];
      favoriteRestaurantIds: string[];
      updatedAt: Date;
    }>,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.addresses !== undefined) {
      updateData.addresses = sql`${JSON.stringify(data.addresses)}::jsonb`;
    }
    if (data.favoriteRestaurantIds !== undefined) {
      updateData.favoriteRestaurantIds = sql`${JSON.stringify(
        data.favoriteRestaurantIds,
      )}::jsonb`;
    }
    if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;

    await this.db
      .updateTable("customers.customers")
      .set(updateData as never)
      .where("id", "=", id)
      .execute();
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.db
      .selectFrom("customers.customers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return customer ? this.mapToCustomer(customer) : null;
  }

  private mapToCustomer(row: unknown): Customer {
    const data = row as Record<string, unknown>;
    return {
      id: data.id as string,
      email: data.email as string,
      name: data.name as string,
      phone: data.phone as string,
      addresses: data.addresses
        ? typeof data.addresses === "string"
          ? JSON.parse(data.addresses)
          : (data.addresses as CustomerAddress[])
        : [],
      favoriteRestaurantIds: data.favoriteRestaurantIds
        ? typeof data.favoriteRestaurantIds === "string"
          ? JSON.parse(data.favoriteRestaurantIds)
          : (data.favoriteRestaurantIds as string[])
        : [],
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }
}

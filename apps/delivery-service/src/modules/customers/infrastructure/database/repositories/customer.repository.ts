import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { ICustomerRepository } from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/entities/customer.entity';
import { CustomerDatabase } from '../../../core/types/customer-database.types';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly db: Kysely<CustomerDatabase>,
    ) {}

    async findById(id: string): Promise<Customer | null> {
        const customer = await this.db
            .selectFrom('customers.customers')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return customer ? this.mapToCustomer(customer) : null;
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const customer = await this.db
            .selectFrom('customers.customers')
            .selectAll()
            .where('email', '=', email.toLowerCase())
            .executeTakeFirst();

        return customer ? this.mapToCustomer(customer) : null;
    }

    async findAll(): Promise<Customer[]> {
        const customers = await this.db
            .selectFrom('customers.customers')
            .selectAll()
            .orderBy('createdAt', 'desc')
            .execute();

        return customers.map((c) => this.mapToCustomer(c));
    }

    private mapToCustomer(row: unknown): Customer {
        const data = row as Record<string, unknown>;
        return {
            id: data.id as string,
            email: data.email as string,
            name: data.name as string,
            phone: data.phone as string,
            address: data.address
                ? typeof data.address === 'string'
                    ? JSON.parse(data.address)
                    : data.address
                : null,
            createdAt: new Date(data.createdAt as string),
            updatedAt: new Date(data.updatedAt as string),
        };
    }
}

import { Generated } from 'kysely';

export interface CustomerAddress {
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
    address: CustomerAddress | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export interface CustomerDatabase {
    'customers.customers': CustomersTable;
}

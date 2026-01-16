import { CustomerAddress } from '../types/customer-database.types';

export interface Customer {
    id: string;
    email: string;
    name: string;
    phone: string;
    address: CustomerAddress | null;
    createdAt: Date;
    updatedAt: Date;
}

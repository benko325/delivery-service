import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const addressSchema = z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const createCustomerSchema = z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(9, 'Phone must be at least 9 characters'),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(9, 'Phone must be at least 9 characters'),
});

export const updateAddressSchema = z.object({
    address: addressSchema,
});

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
export class UpdateCustomerDto extends createZodDto(updateCustomerSchema) {}
export class UpdateAddressDto extends createZodDto(updateAddressSchema) {}

import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const driverStatusSchema = z.enum(['available', 'busy', 'offline']);

export const createDriverSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(9, 'Phone must be at least 9 characters'),
    vehicleType: z.string().min(2, 'Vehicle type is required'),
    licensePlate: z.string().min(2, 'License plate is required'),
});

export const updateDriverSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(9, 'Phone must be at least 9 characters'),
    vehicleType: z.string().min(2, 'Vehicle type is required'),
    licensePlate: z.string().min(2, 'License plate is required'),
});

export const updateLocationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

export const setAvailabilitySchema = z.object({
    status: driverStatusSchema,
});

export class CreateDriverDto extends createZodDto(createDriverSchema) {}
export class UpdateDriverDto extends createZodDto(updateDriverSchema) {}
export class UpdateLocationDto extends createZodDto(updateLocationSchema) {}
export class SetAvailabilityDto extends createZodDto(setAvailabilitySchema) {}

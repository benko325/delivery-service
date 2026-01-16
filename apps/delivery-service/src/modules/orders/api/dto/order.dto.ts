import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const orderStatusSchema = z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'driver_assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'cancelled',
]);

const deliveryAddressSchema = z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    instructions: z.string().optional(),
});

const orderItemSchema = z.object({
    menuItemId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    deliveryAddress: deliveryAddressSchema,
    deliveryFee: z.number().min(0).default(0),
});

export const acceptOrderSchema = z.object({
    estimatedMinutes: z.number().int().positive().default(30),
});

export const updateOrderStatusSchema = z.object({
    status: orderStatusSchema,
});

export const cancelOrderSchema = z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class AcceptOrderDto extends createZodDto(acceptOrderSchema) {}
export class UpdateOrderStatusDto extends createZodDto(updateOrderStatusSchema) {}
export class CancelOrderDto extends createZodDto(cancelOrderSchema) {}

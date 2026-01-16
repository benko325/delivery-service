import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const addItemToCartSchema = z.object({
    menuItemId: z.string().uuid('Invalid menu item ID'),
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    name: z.string().min(1, 'Name is required'),
    price: z.number().positive('Price must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
    quantity: z.number().int().positive('Quantity must be positive').default(1),
});

export const updateItemQuantitySchema = z.object({
    menuItemId: z.string().uuid('Invalid menu item ID'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const removeItemFromCartSchema = z.object({
    menuItemId: z.string().uuid('Invalid menu item ID'),
});

export class AddItemToCartDto extends createZodDto(addItemToCartSchema) {}
export class UpdateItemQuantityDto extends createZodDto(updateItemQuantitySchema) {}
export class RemoveItemFromCartDto extends createZodDto(removeItemFromCartSchema) {}

import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const addItemToCartSchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item ID"),
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

export const updateItemQuantitySchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item ID"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export const removeItemFromCartSchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item ID"),
});

export const deliveryAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instructions: z.string().optional(),
});

export const checkoutCartSchema = z.object({
  deliveryAddress: deliveryAddressSchema,
  deliveryFee: z.number().min(0, "Delivery fee cannot be negative").default(0),
});

export class AddItemToCartDto extends createZodDto(addItemToCartSchema) {}
export class UpdateItemQuantityDto extends createZodDto(
  updateItemQuantitySchema,
) {}
export class RemoveItemFromCartDto extends createZodDto(
  removeItemFromCartSchema,
) {}
export class CheckoutCartDto extends createZodDto(checkoutCartSchema) {}

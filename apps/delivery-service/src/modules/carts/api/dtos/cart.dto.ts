import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

class CartItemDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  menuItemId!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  restaurantId!: string;

  @ApiProperty({ example: "Margherita Pizza" })
  name!: string;

  @ApiProperty({ example: 12.99 })
  price!: number;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;
}

export class CartResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  customerId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174002",
    required: false,
  })
  restaurantId?: string | null;

  @ApiProperty({ type: [CartItemDto] })
  items!: CartItemDto[];

  @ApiProperty({ example: 25.98 })
  totalAmount!: number;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

export const addItemToCartSchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item ID"),
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("EUR"),
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

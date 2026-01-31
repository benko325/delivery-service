import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

const orderStatusSchema = z.enum([
  "pending",
  "payment_succeeded",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "in_transit",
  "delivered",
  "cancelled",
]);

class OrderItemDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  menuItemId!: string;

  @ApiProperty({ example: "Margherita Pizza" })
  name!: string;

  @ApiProperty({ example: 12.99 })
  price!: number;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;
}

class DeliveryAddressDto {
  @ApiProperty({ example: "123 Main Street" })
  street!: string;

  @ApiProperty({ example: "New York" })
  city!: string;

  @ApiProperty({ example: "10001" })
  postalCode!: string;

  @ApiProperty({ example: "USA" })
  country!: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  customerId!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174002" })
  restaurantId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174003",
    required: false,
  })
  driverId?: string | null;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];

  @ApiProperty({ type: DeliveryAddressDto })
  deliveryAddress!: DeliveryAddressDto;

  @ApiProperty({
    enum: [
      "pending",
      "payment_succeeded",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "in_transit",
      "delivered",
      "cancelled",
    ],
    example: "pending",
  })
  status!: string;

  @ApiProperty({ example: 25.98 })
  totalAmount!: number;

  @ApiProperty({ example: 5.0 })
  deliveryFee!: number;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: "2024-01-01T01:00:00.000Z", required: false })
  estimatedDeliveryTime?: Date | null;

  @ApiProperty({ example: "2024-01-01T01:15:00.000Z", required: false })
  actualDeliveryTime?: Date | null;

  @ApiProperty({ example: "2024-01-01T00:30:00.000Z", required: false })
  cancelledAt?: Date | null;

  @ApiProperty({ example: "Customer requested cancellation", required: false })
  cancellationReason?: string | null;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

const deliveryAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instructions: z.string().optional(),
});

const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("EUR"),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  deliveryAddress: deliveryAddressSchema,
  deliveryFee: z.number().min(0).default(0),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("EUR"),
});

export const acceptOrderSchema = z.object({
  estimatedMinutes: z.number().int().positive().default(30),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class AcceptOrderDto extends createZodDto(acceptOrderSchema) {}
export class UpdateOrderStatusDto extends createZodDto(
  updateOrderStatusSchema,
) {}
export class CancelOrderDto extends createZodDto(cancelOrderSchema) {}

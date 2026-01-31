import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

class RestaurantAddressDto {
  @ApiProperty({ example: "123 Main Street" })
  street!: string;

  @ApiProperty({ example: "New York" })
  city!: string;

  @ApiProperty({ example: "NY", required: false })
  state?: string;

  @ApiProperty({ example: "10001" })
  postalCode!: string;

  @ApiProperty({ example: "USA" })
  country!: string;

  @ApiProperty({ example: 40.7128, required: false })
  latitude?: number;

  @ApiProperty({ example: -74.006, required: false })
  longitude?: number;
}

class OpeningHoursSlotDto {
  @ApiProperty({ example: "09:00" })
  open!: string;

  @ApiProperty({ example: "22:00" })
  close!: string;
}

export class RestaurantResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  ownerId!: string;

  @ApiProperty({ example: "Pizza Paradise" })
  name!: string;

  @ApiProperty({ example: "Authentic Italian pizza with fresh ingredients" })
  description!: string;

  @ApiProperty({ type: RestaurantAddressDto })
  address!: RestaurantAddressDto;

  @ApiProperty({ example: "+1-555-0101" })
  phone!: string;

  @ApiProperty({ example: "contact@pizzaparadise.com" })
  email!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "object",
      properties: {
        open: { type: "string", example: "09:00" },
        close: { type: "string", example: "22:00" },
      },
    },
    example: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
    },
  })
  openingHours!: Record<string, OpeningHoursSlotDto>;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const openingHoursSchema = z.record(
  z.object({
    open: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    close: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  }),
);

export const createRestaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: addressSchema,
  phone: z.string().min(9, "Phone must be at least 9 characters"),
  email: z.string().email("Invalid email format"),
  openingHours: openingHoursSchema.optional().default({}),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: addressSchema,
  phone: z.string().min(9, "Phone must be at least 9 characters"),
  email: z.string().email("Invalid email format"),
  openingHours: openingHoursSchema,
});

export const confirmOrderSchema = z.object({
  estimatedPreparationMinutes: z.number().int().positive().default(30),
});

export const rejectOrderSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export class CreateRestaurantDto extends createZodDto(createRestaurantSchema) {}
export class UpdateRestaurantDto extends createZodDto(updateRestaurantSchema) {}
export class ConfirmOrderDto extends createZodDto(confirmOrderSchema) {}
export class RejectOrderDto extends createZodDto(rejectOrderSchema) {}

import { z } from "zod";
import { createZodDto } from "nestjs-zod";

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

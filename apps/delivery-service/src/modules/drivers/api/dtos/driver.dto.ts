import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const driverStatusSchema = z.enum(["available", "busy", "offline"]);

export const createDriverSchema = z.object({
  vehicleType: z.string().min(2, "Vehicle type is required"),
  licensePlate: z.string().min(2, "License plate is required"),
});

export const updateDriverSchema = z.object({
  vehicleType: z.string().min(2, "Vehicle type is required"),
  licensePlate: z.string().min(2, "License plate is required"),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const setAvailabilitySchema = z.object({
  status: driverStatusSchema,
});

export const rejectDeliverySchema = z.object({
  reason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must be at most 500 characters"),
});

export class CreateDriverDto extends createZodDto(createDriverSchema) {}
export class UpdateDriverDto extends createZodDto(updateDriverSchema) {}
export class UpdateLocationDto extends createZodDto(updateLocationSchema) {}
export class SetAvailabilityDto extends createZodDto(setAvailabilitySchema) {}
export class RejectDeliveryDto extends createZodDto(rejectDeliverySchema) {}

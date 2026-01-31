import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

const driverStatusSchema = z.enum(["available", "busy", "offline"]);

class DriverLocationDto {
  @ApiProperty({ example: 40.7128 })
  latitude!: number;

  @ApiProperty({ example: -74.006 })
  longitude!: number;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

export class DriverResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  userId!: string;

  @ApiProperty({ example: "Sedan" })
  vehicleType!: string;

  @ApiProperty({ example: "ABC-1234" })
  licensePlate!: string;

  @ApiProperty({
    enum: ["available", "busy", "offline"],
    example: "available",
  })
  status!: "available" | "busy" | "offline";

  @ApiProperty({ type: DriverLocationDto, required: false })
  currentLocation?: DriverLocationDto | null;

  @ApiProperty({ example: 4.8 })
  rating!: number;

  @ApiProperty({ example: 150 })
  totalDeliveries!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

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

export class CreateDriverDto extends createZodDto(createDriverSchema) {}
export class UpdateDriverDto extends createZodDto(updateDriverSchema) {}
export class UpdateLocationDto extends createZodDto(updateLocationSchema) {}
export class SetAvailabilityDto extends createZodDto(setAvailabilitySchema) {}

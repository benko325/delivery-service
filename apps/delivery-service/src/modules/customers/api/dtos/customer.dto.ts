import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

class CustomerAddressDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "Home", required: false })
  label?: string;

  @ApiProperty({ example: "123 Main Street" })
  street!: string;

  @ApiProperty({ example: "New York" })
  city!: string;

  @ApiProperty({ example: "10001" })
  postalCode!: string;

  @ApiProperty({ example: "USA" })
  country!: string;

  @ApiProperty({ example: 40.7128, required: false })
  latitude?: number;

  @ApiProperty({ example: -74.006, required: false })
  longitude?: number;
}

export class CustomerResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "customer@example.com" })
  email!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;

  @ApiProperty({ example: "+1-555-0101" })
  phone!: string;

  @ApiProperty({ type: [CustomerAddressDto] })
  addresses!: CustomerAddressDto[];

  @ApiProperty({
    type: [String],
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
  })
  favoriteRestaurantIds!: string[];

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createCustomerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(9, "Phone must be at least 9 characters"),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(9, "Phone must be at least 9 characters"),
});

export const addAddressSchema = z.object({
  address: addressSchema,
});

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
export class UpdateCustomerDto extends createZodDto(updateCustomerSchema) {}
export class AddAddressDto extends createZodDto(addAddressSchema) {}

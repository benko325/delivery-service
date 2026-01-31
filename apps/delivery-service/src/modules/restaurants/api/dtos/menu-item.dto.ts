import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export class MenuItemResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  restaurantId!: string;

  @ApiProperty({ example: "Margherita Pizza" })
  name!: string;

  @ApiProperty({ example: "Classic pizza with tomato, mozzarella, and basil" })
  description!: string;

  @ApiProperty({ example: 12.99 })
  price!: number;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({
    enum: ["appetizer", "main_course", "dessert", "beverage", "side"],
    example: "main_course",
  })
  category!: "appetizer" | "main_course" | "dessert" | "beverage" | "side";

  @ApiProperty({
    example: "https://example.com/images/pizza.jpg",
    required: false,
  })
  imageUrl?: string | null;

  @ApiProperty({ example: 15 })
  preparationTime!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt!: Date;
}

const menuItemCategorySchema = z.enum([
  "appetizer",
  "main_course",
  "dessert",
  "beverage",
  "side",
]);

export const createMenuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().positive("Price must be positive"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("EUR"),
  category: menuItemCategorySchema,
  imageUrl: z.string().url("Invalid URL").nullable().optional(),
  preparationTime: z.number().int().positive().default(15),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().positive("Price must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  category: menuItemCategorySchema,
  imageUrl: z.string().url("Invalid URL").nullable().optional(),
  preparationTime: z.number().int().positive(),
  isAvailable: z.boolean(),
});

export class CreateMenuItemDto extends createZodDto(createMenuItemSchema) {}
export class UpdateMenuItemDto extends createZodDto(updateMenuItemSchema) {}

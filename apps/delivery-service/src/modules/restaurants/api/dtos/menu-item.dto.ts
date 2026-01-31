import { z } from "zod";
import { createZodDto } from "nestjs-zod";

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

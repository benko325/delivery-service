import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const payForOrderSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});

export class PayForOrderDto extends createZodDto(payForOrderSchema) {}

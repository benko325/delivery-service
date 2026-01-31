import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(9, "Phone must be at least 9 characters"),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "driver", "admin", "restaurant_owner"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
export class UpdateUserRoleDto extends createZodDto(updateUserRoleSchema) {}

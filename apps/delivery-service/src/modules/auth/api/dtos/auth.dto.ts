import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  accessToken!: string;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  refreshToken!: string;
}

export class UserInfoResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  userId!: string;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ type: [String], example: ["customer"] })
  roles!: string[];
}

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

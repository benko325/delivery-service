import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UpdateUserRoleDto,
  AuthResponseDto,
  UserInfoResponseDto,
} from "../dtos/auth.dto";
import { RegisterCommand } from "../../application/commands/register/register.command";
import { LoginCommand } from "../../application/commands/login/login.command";
import { RefreshTokenCommand } from "../../application/commands/refresh-token/refresh-token.command";
import { UpdateUserRoleCommand } from "../../application/commands/update-user-role/update-user-role.command";
import { JwtAuthGuard } from "../../../shared-kernel/api/guards/jwt.guard";
import { RolesGuard } from "../../../shared-kernel/api/guards/roles.guard";
import { Roles } from "../../../shared-kernel/api/decorators/roles.decorator";
import { User } from "../../../shared-kernel/api/decorators/user.decorator";
import { RequestUser } from "../../../shared-kernel/core/types/user-types";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user [Public]" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async register(@Body(ZodValidationPipe) dto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.name, dto.phone),
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user [Public]" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body(ZodValidationPipe) dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token [Public]" })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refreshToken(@Body(ZodValidationPipe) dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user info [Any Role]" })
  @ApiResponse({
    status: 200,
    description: "Current user info",
    type: UserInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async me(@User() user: RequestUser) {
    return {
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    };
  }

  @Patch("users/:userId/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user role [Admin]" })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  async updateUserRole(
    @Param("userId") userId: string,
    @Body(ZodValidationPipe) dto: UpdateUserRoleDto,
  ) {
    return this.commandBus.execute(new UpdateUserRoleCommand(userId, dto.role));
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { DeactivateDriverCommand } from "../../application/commands/deactivate-driver/deactivate-driver.command";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { JwtAuthGuard } from "../../../shared-kernel/api/guards/jwt.guard";
import { RolesGuard } from "../../../shared-kernel/api/guards/roles.guard";
import { Roles } from "../../../shared-kernel/api/decorators/roles.decorator";
import { User } from "../../../shared-kernel/api/decorators/user.decorator";
import { RequestUser } from "../../../shared-kernel/core/types/user-types";
import {
  CreateDriverDto,
  UpdateDriverDto,
  UpdateLocationDto,
  SetAvailabilityDto,
} from "../dto/driver.dto";
import { CreateDriverCommand } from "../../application/commands/create-driver/create-driver.command";
import { UpdateDriverCommand } from "../../application/commands/update-driver/update-driver.command";
import { UpdateDriverLocationCommand } from "../../application/commands/update-driver-location/update-driver-location.command";
import { SetDriverAvailabilityCommand } from "../../application/commands/set-driver-availability/set-driver-availability.command";
import { GetDriverByIdQuery } from "../../application/queries/get-driver-by-id/get-driver-by-id.query";
import { GetAllDriversQuery } from "../../application/queries/get-all-drivers/get-all-drivers.query";
import { GetAvailableDriversQuery } from "../../application/queries/get-available-drivers/get-available-drivers.query";

@ApiTags("Drivers")
@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DriversController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Get all drivers (admin only)" })
  @ApiResponse({ status: 200, description: "List of all drivers" })
  async findAll() {
    return this.queryBus.execute(new GetAllDriversQuery());
  }

  @Get("available")
  @Roles("admin", "restaurant_owner")
  @ApiOperation({ summary: "Get available drivers" })
  @ApiResponse({ status: 200, description: "List of available drivers" })
  async findAvailable() {
    return this.queryBus.execute(new GetAvailableDriversQuery());
  }

  @Get("me")
  @Roles("driver")
  @ApiOperation({ summary: "Get current driver profile" })
  @ApiResponse({ status: 200, description: "Driver profile" })
  async getMyProfile(@User() user: RequestUser) {
    return this.queryBus.execute(new GetDriverByIdQuery(user.userId, true));
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get driver by ID (admin only)" })
  @ApiResponse({ status: 200, description: "Driver details" })
  async findById(@Param("id") id: string) {
    return this.queryBus.execute(new GetDriverByIdQuery(id, false));
  }

  @Post()
  @ApiOperation({ summary: "Create a new driver" })
  @ApiResponse({ status: 201, description: "Driver created" })
  async create(
    @Req() req: Request & { user: RequestUser },
    @Body(ZodValidationPipe) dto: CreateDriverDto,
  ) {
    return this.commandBus.execute(
      new CreateDriverCommand(
        req.user.userId,
        dto.vehicleType,
        dto.licensePlate,
      ),
    );
  }

  @Put("me")
  @Roles("driver")
  @ApiOperation({ summary: "Update current driver profile" })
  @ApiResponse({ status: 200, description: "Profile updated" })
  async updateMyProfile(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: UpdateDriverDto,
  ) {
    return this.commandBus.execute(
      new UpdateDriverCommand(
        user.userId,
        dto.vehicleType,
        dto.licensePlate,
        true,
      ),
    );
  }

  @Patch("me/location")
  @Roles("driver")
  @ApiOperation({ summary: "Update driver location" })
  @ApiResponse({ status: 200, description: "Location updated" })
  async updateLocation(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: UpdateLocationDto,
  ) {
    return this.commandBus.execute(
      new UpdateDriverLocationCommand(
        user.userId,
        dto.latitude,
        dto.longitude,
        true,
      ),
    );
  }

  @Patch("me/availability")
  @Roles("driver")
  @ApiOperation({ summary: "Set driver availability status" })
  @ApiResponse({ status: 200, description: "Availability updated" })
  async setAvailability(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: SetAvailabilityDto,
  ) {
    return this.commandBus.execute(
      new SetDriverAvailabilityCommand(user.userId, dto.status, true),
    );
  }

  @Patch("me/deactivate")
  @Roles("driver")
  @ApiOperation({ summary: "Deactivate current driver account" })
  @ApiResponse({ status: 200, description: "Driver deactivated" })
  async deactivateMyAccount(@User() user: RequestUser) {
    // resolve driver entity by userId and send entity id to command
    const driver = await this.queryBus.execute(
      new GetDriverByIdQuery(user.userId, true),
    );
    if (!driver) {
      throw new NotFoundException("Driver profile not found");
    }
    return this.commandBus.execute(
      new DeactivateDriverCommand(driver.id, user.userId, "driver"),
    );
  }

  @Patch(":id/deactivate")
  @Roles("admin")
  @ApiOperation({ summary: "Deactivate a driver (admin only)" })
  @ApiResponse({ status: 200, description: "Driver deactivated" })
  async deactivateDriver(@Param("id") id: string, @User() user: RequestUser) {
    // pass admin user id and role so handler can audit/authorize
    return this.commandBus.execute(
      new DeactivateDriverCommand(id, user.userId, "admin"),
    );
  }
}

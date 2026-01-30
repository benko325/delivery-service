import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
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
} from "../dtos/driver.dto";
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
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new driver (admin only)" })
  @ApiResponse({ status: 201, description: "Driver created" })
  async create(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: CreateDriverDto,
  ) {
    return this.commandBus.execute(
      new CreateDriverCommand(
        user.userId,
        dto.name,
        dto.email,
        dto.phone,
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
        dto.name,
        dto.phone,
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
}

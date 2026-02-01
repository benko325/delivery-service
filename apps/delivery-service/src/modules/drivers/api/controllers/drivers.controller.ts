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
  RejectDeliveryDto,
  DriverResponseDto,
} from "../dtos/driver.dto";
import { CreateDriverCommand } from "../../application/commands/create-driver/create-driver.command";
import { UpdateDriverCommand } from "../../application/commands/update-driver/update-driver.command";
import { UpdateDriverLocationCommand } from "../../application/commands/update-driver-location/update-driver-location.command";
import { SetDriverAvailabilityCommand } from "../../application/commands/set-driver-availability/set-driver-availability.command";
import { GetDriverByIdQuery } from "../../application/queries/get-driver-by-id/get-driver-by-id.query";
import { GetAllDriversQuery } from "../../application/queries/get-all-drivers/get-all-drivers.query";
import { GetAvailableDriversQuery } from "../../application/queries/get-available-drivers/get-available-drivers.query";
import { AcceptDeliveryCommand } from "../../application/commands/accept-delivery/accept-delivery.command";
import { RejectDeliveryCommand } from "../../application/commands/reject-delivery/reject-delivery.command";
import { CompleteDeliveryCommand } from "../../application/commands/complete-delivery/complete-delivery.command";

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
  @ApiResponse({
    status: 200,
    description: "List of all drivers",
    type: [DriverResponseDto],
  })
  async findAll() {
    return this.queryBus.execute(new GetAllDriversQuery());
  }

  @Get("available")
  @Roles("admin", "restaurant_owner")
  @ApiOperation({ summary: "Get available drivers" })
  @ApiResponse({
    status: 200,
    description: "List of available drivers",
    type: [DriverResponseDto],
  })
  async findAvailable() {
    return this.queryBus.execute(new GetAvailableDriversQuery());
  }

  @Get("me")
  @Roles("driver")
  @ApiOperation({ summary: "Get current driver profile" })
  @ApiResponse({
    status: 200,
    description: "Driver profile",
    type: DriverResponseDto,
  })
  async getMyProfile(@User() user: RequestUser) {
    return this.queryBus.execute(new GetDriverByIdQuery(user.userId, true));
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get driver by ID (admin only)" })
  @ApiResponse({
    status: 200,
    description: "Driver details",
    type: DriverResponseDto,
  })
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

  @Post("deliveries/:orderId/accept")
  @Roles("driver")
  @ApiOperation({ summary: "Accept a delivery" })
  @ApiResponse({ status: 200, description: "Delivery accepted" })
  async acceptDelivery(
    @User() user: RequestUser,
    @Param("orderId") orderId: string,
  ) {
    return this.commandBus.execute(
      new AcceptDeliveryCommand(user.userId, orderId),
    );
  }

  @Post("deliveries/:orderId/reject")
  @Roles("driver")
  @ApiOperation({ summary: "Reject a delivery" })
  @ApiResponse({ status: 200, description: "Delivery rejected" })
  async rejectDelivery(
    @User() user: RequestUser,
    @Param("orderId") orderId: string,
    @Body(ZodValidationPipe) dto: RejectDeliveryDto,
  ) {
    return this.commandBus.execute(
      new RejectDeliveryCommand(user.userId, orderId, dto.reason),
    );
  }

  @Post("deliveries/complete")
  @Roles("driver")
  @ApiOperation({ summary: "Complete current delivery" })
  @ApiResponse({ status: 200, description: "Delivery completed" })
  async completeDelivery(@User() user: RequestUser) {
    return this.commandBus.execute(new CompleteDeliveryCommand(user.userId));
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

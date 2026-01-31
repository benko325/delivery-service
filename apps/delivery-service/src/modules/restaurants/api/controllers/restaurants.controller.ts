import {
  Controller,
  Get,
  Post,
  Put,
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
  CreateRestaurantDto,
  UpdateRestaurantDto,
  ConfirmOrderDto,
  RejectOrderDto,
} from "../dtos/restaurant.dto";
import { CreateRestaurantCommand } from "../../application/commands/create-restaurant/create-restaurant.command";
import { UpdateRestaurantCommand } from "../../application/commands/update-restaurant/update-restaurant.command";
import { ActivateRestaurantCommand } from "../../application/commands/activate-restaurant/activate-restaurant.command";
import { DeactivateRestaurantCommand } from "../../application/commands/deactivate-restaurant/deactivate-restaurant.command";
import { ConfirmOrderCommand } from "../../application/commands/confirm-order/confirm-order.command";
import { RejectOrderCommand } from "../../application/commands/reject-order/reject-order.command";
import { GetRestaurantByIdQuery } from "../../application/queries/get-restaurant-by-id/get-restaurant-by-id.query";
import { GetAllRestaurantsQuery } from "../../application/queries/get-all-restaurants/get-all-restaurants.query";

@ApiTags("Restaurants")
@Controller("restaurants")
export class RestaurantsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all active restaurants [Public]" })
  @ApiResponse({ status: 200, description: "List of active restaurants" })
  async findAll() {
    return this.queryBus.execute(new GetAllRestaurantsQuery(true));
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all restaurants including inactive [Admin]",
  })
  @ApiResponse({ status: 200, description: "List of all restaurants" })
  async findAllIncludingInactive() {
    return this.queryBus.execute(new GetAllRestaurantsQuery(false));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get restaurant by ID [Public]" })
  @ApiResponse({ status: 200, description: "Restaurant details" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async findById(@Param("id") id: string) {
    return this.queryBus.execute(new GetRestaurantByIdQuery(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new restaurant [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 201, description: "Restaurant created" })
  async create(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: CreateRestaurantDto,
  ) {
    return this.commandBus.execute(
      new CreateRestaurantCommand(
        user.userId,
        dto.name,
        dto.description,
        dto.address,
        dto.phone,
        dto.email,
        dto.openingHours,
      ),
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update restaurant [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Restaurant updated" })
  async update(
    @Param("id") id: string,
    @Body(ZodValidationPipe) dto: UpdateRestaurantDto,
  ) {
    return this.commandBus.execute(
      new UpdateRestaurantCommand(
        id,
        dto.name,
        dto.description,
        dto.address,
        dto.phone,
        dto.email,
        dto.openingHours,
      ),
    );
  }

  @Post(":id/activate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Activate restaurant [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Restaurant activated" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async activate(@Param("id") id: string) {
    return this.commandBus.execute(new ActivateRestaurantCommand(id));
  }

  @Post(":id/deactivate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Deactivate restaurant [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Restaurant deactivated" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async deactivate(@Param("id") id: string) {
    return this.commandBus.execute(new DeactivateRestaurantCommand(id));
  }

  @Post(":restaurantId/orders/:orderId/confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm an order [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Order confirmed" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  @ApiResponse({ status: 400, description: "Restaurant is not active" })
  async confirmOrder(
    @Param("restaurantId") restaurantId: string,
    @Param("orderId") orderId: string,
    @Body(ZodValidationPipe) dto: ConfirmOrderDto,
  ) {
    return this.commandBus.execute(
      new ConfirmOrderCommand(
        restaurantId,
        orderId,
        dto.estimatedPreparationMinutes,
      ),
    );
  }

  @Post(":restaurantId/orders/:orderId/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reject an order [Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Order rejected" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async rejectOrder(
    @Param("restaurantId") restaurantId: string,
    @Param("orderId") orderId: string,
    @Body(ZodValidationPipe) dto: RejectOrderDto,
  ) {
    return this.commandBus.execute(
      new RejectOrderCommand(restaurantId, orderId, dto.reason),
    );
  }
}

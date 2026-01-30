import {
  Controller,
  Get,
  Post,
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
  CreateOrderDto,
  AcceptOrderDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
} from "../dtos/order.dto";
import { CreateOrderCommand } from "../../application/commands/create-order/create-order.command";
import { AcceptOrderCommand } from "../../application/commands/accept-order/accept-order.command";
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status/update-order-status.command";
import { CancelOrderCommand } from "../../application/commands/cancel-order/cancel-order.command";
import { GetOrderByIdQuery } from "../../application/queries/get-order-by-id/get-order-by-id.query";
import { GetOrdersByCustomerQuery } from "../../application/queries/get-orders-by-customer/get-orders-by-customer.query";
import { GetAvailableOrdersQuery } from "../../application/queries/get-available-orders/get-available-orders.query";
import { GetOrdersByDriverQuery } from "../../application/queries/get-orders-by-driver/get-orders-by-driver.query";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // Customer endpoints
  @Post()
  @Roles("customer")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new order [Customer]" })
  @ApiResponse({ status: 201, description: "Order created" })
  async createOrder(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: CreateOrderDto,
  ) {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.commandBus.execute(
      new CreateOrderCommand(
        user.userId,
        dto.restaurantId,
        dto.items,
        dto.deliveryAddress,
        totalAmount,
        dto.deliveryFee,
      ),
    );
  }

  @Get("my-orders")
  @Roles("customer")
  @ApiOperation({ summary: "Get customer orders [Customer]" })
  @ApiResponse({ status: 200, description: "List of customer orders" })
  async getMyOrders(@User() user: RequestUser) {
    return this.queryBus.execute(new GetOrdersByCustomerQuery(user.userId));
  }

  // Driver endpoints
  @Get("available")
  @Roles("driver")
  @ApiOperation({ summary: "Get available orders for drivers [Driver]" })
  @ApiResponse({ status: 200, description: "List of available orders" })
  async getAvailableOrders() {
    return this.queryBus.execute(new GetAvailableOrdersQuery());
  }

  @Get("my-deliveries")
  @Roles("driver")
  @ApiOperation({ summary: "Get driver deliveries [Driver]" })
  @ApiResponse({ status: 200, description: "List of driver deliveries" })
  async getMyDeliveries(@User() user: RequestUser) {
    return this.queryBus.execute(new GetOrdersByDriverQuery(user.userId));
  }

  @Post(":id/accept")
  @Roles("driver")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept an order [Driver]" })
  @ApiResponse({ status: 200, description: "Order accepted" })
  async acceptOrder(
    @User() user: RequestUser,
    @Param("id") orderId: string,
    @Body(ZodValidationPipe) dto: AcceptOrderDto,
  ) {
    return this.commandBus.execute(
      new AcceptOrderCommand(orderId, user.userId, dto.estimatedMinutes),
    );
  }

  // Restaurant and admin endpoints
  @Patch(":id/status")
  @Roles("admin", "restaurant_owner", "driver")
  @ApiOperation({ summary: "Update order status [Admin, Restaurant Owner, Driver]" })
  @ApiResponse({ status: 200, description: "Order status updated" })
  async updateOrderStatus(
    @Param("id") orderId: string,
    @Body(ZodValidationPipe) dto: UpdateOrderStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateOrderStatusCommand(orderId, dto.status),
    );
  }

  @Post(":id/cancel")
  @Roles("customer", "admin", "restaurant_owner")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel an order [Customer, Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Order cancelled" })
  async cancelOrder(
    @Param("id") orderId: string,
    @Body(ZodValidationPipe) dto: CancelOrderDto,
  ) {
    return this.commandBus.execute(new CancelOrderCommand(orderId, dto.reason));
  }

  // General endpoints
  @Get(":id")
  @Roles("customer", "driver", "admin", "restaurant_owner")
  @ApiOperation({ summary: "Get order by ID [Customer, Driver, Admin, Restaurant Owner]" })
  @ApiResponse({ status: 200, description: "Order details" })
  async getOrderById(@Param("id") orderId: string) {
    return this.queryBus.execute(new GetOrderByIdQuery(orderId));
  }
}

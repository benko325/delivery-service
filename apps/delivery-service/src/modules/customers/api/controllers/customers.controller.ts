import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  CreateCustomerDto,
  UpdateCustomerDto,
  AddAddressDto,
} from "../dto/customer.dto";
import { CreateCustomerCommand } from "../../application/commands/create-customer/create-customer.command";
import { UpdateCustomerCommand } from "../../application/commands/update-customer/update-customer.command";
import { AddCustomerAddressCommand } from "../../application/commands/add-customer-address/add-customer-address.command";
import { RemoveCustomerAddressCommand } from "../../application/commands/remove-customer-address/remove-customer-address.command";
import { AddRestaurantToFavoritesCommand } from "../../application/commands/add-restaurant-to-favorites/add-restaurant-to-favorites.command";
import { RemoveRestaurantFromFavoritesCommand } from "../../application/commands/remove-restaurant-from-favorites/remove-restaurant-from-favorites.command";
import { GetCustomerByIdQuery } from "../../application/queries/get-customer-by-id/get-customer-by-id.query";
import { GetAllCustomersQuery } from "../../application/queries/get-all-customers/get-all-customers.query";
import { GetFavoriteRestaurantsQuery } from "../../application/queries/get-favorite-restaurants/get-favorite-restaurants.query";

@ApiTags("Customers")
@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Get all customers (admin only)" })
  @ApiResponse({ status: 200, description: "List of all customers" })
  async findAll() {
    return this.queryBus.execute(new GetAllCustomersQuery());
  }

  @Get("me")
  @Roles("customer")
  @ApiOperation({ summary: "Get current customer profile" })
  @ApiResponse({ status: 200, description: "Customer profile" })
  async getMyProfile(@User() user: RequestUser) {
    return this.queryBus.execute(new GetCustomerByIdQuery(user.userId));
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get customer by ID (admin only)" })
  @ApiResponse({ status: 200, description: "Customer details" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async findById(@Param("id") id: string) {
    return this.queryBus.execute(new GetCustomerByIdQuery(id));
  }

  @Post()
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new customer (admin only)" })
  @ApiResponse({ status: 201, description: "Customer created" })
  async create(@Body(ZodValidationPipe) dto: CreateCustomerDto) {
    return this.commandBus.execute(
      new CreateCustomerCommand(null, dto.email, dto.name, dto.phone),
    );
  }

  @Put("me")
  @Roles("customer")
  @ApiOperation({ summary: "Update current customer profile" })
  @ApiResponse({ status: 200, description: "Profile updated" })
  async updateMyProfile(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: UpdateCustomerDto,
  ) {
    return this.commandBus.execute(
      new UpdateCustomerCommand(user.userId, dto.name, dto.phone),
    );
  }

  @Post("me/addresses")
  @Roles("customer")
  @ApiOperation({ summary: "Add new address to customer profile" })
  @ApiResponse({ status: 200, description: "Address added" })
  async addAddress(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: AddAddressDto,
  ) {
    return this.commandBus.execute(
      new AddCustomerAddressCommand(user.userId, dto.address),
    );
  }

  @Delete("me/addresses/:addressId")
  @Roles("customer")
  @ApiOperation({ summary: "Remove address from customer profile" })
  @ApiResponse({ status: 200, description: "Address removed" })
  async removeAddress(
    @User() user: RequestUser,
    @Param("addressId") addressId: string,
  ) {
    return this.commandBus.execute(
      new RemoveCustomerAddressCommand(user.userId, addressId),
    );
  }

  @Post("me/favorites/:restaurantId")
  @Roles("customer")
  @ApiOperation({ summary: "Add restaurant to favorites" })
  @ApiResponse({ status: 200, description: "Added to favorites" })
  async addFavorite(
    @User() user: RequestUser,
    @Param("restaurantId") restaurantId: string,
  ) {
    return this.commandBus.execute(
      new AddRestaurantToFavoritesCommand(user.userId, restaurantId),
    );
  }

  @Get("me/favorites")
  @Roles("customer")
  @ApiOperation({ summary: "Get all favorite restaurants" })
  @ApiResponse({ status: 200, description: "List of favorite restaurants" })
  async getFavorites(@User() user: RequestUser) {
    return this.queryBus.execute(new GetFavoriteRestaurantsQuery(user.userId));
  }

  @Delete("me/favorites/:restaurantId")
  @Roles("customer")
  @ApiOperation({ summary: "Remove restaurant from favorites" })
  @ApiResponse({ status: 200, description: "Removed from favorites" })
  async removeFavorite(
    @User() user: RequestUser,
    @Param("restaurantId") restaurantId: string,
  ) {
    return this.commandBus.execute(
      new RemoveRestaurantFromFavoritesCommand(user.userId, restaurantId),
    );
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update customer by ID (admin only)" })
  @ApiResponse({ status: 200, description: "Customer updated" })
  async update(
    @Param("id") id: string,
    @Body(ZodValidationPipe) dto: UpdateCustomerDto,
  ) {
    return this.commandBus.execute(
      new UpdateCustomerCommand(id, dto.name, dto.phone),
    );
  }
}

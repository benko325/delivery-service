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
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateAddressDto,
} from "../dtos/customer.dto";
import { CreateCustomerCommand } from "../../application/commands/create-customer/create-customer.command";
import { UpdateCustomerCommand } from "../../application/commands/update-customer/update-customer.command";
import { UpdateCustomerAddressCommand } from "../../application/commands/update-customer-address/update-customer-address.command";
import { GetCustomerByIdQuery } from "../../application/queries/get-customer-by-id/get-customer-by-id.query";
import { GetAllCustomersQuery } from "../../application/queries/get-all-customers/get-all-customers.query";

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
  @ApiOperation({ summary: "Get all customers [Admin]" })
  @ApiResponse({ status: 200, description: "List of all customers" })
  async findAll() {
    return this.queryBus.execute(new GetAllCustomersQuery());
  }

  @Get("me")
  @Roles("customer")
  @ApiOperation({ summary: "Get current customer profile [Customer]" })
  @ApiResponse({ status: 200, description: "Customer profile" })
  async getMyProfile(@User() user: RequestUser) {
    return this.queryBus.execute(new GetCustomerByIdQuery(user.userId));
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get customer by ID [Admin]" })
  @ApiResponse({ status: 200, description: "Customer details" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async findById(@Param("id") id: string) {
    return this.queryBus.execute(new GetCustomerByIdQuery(id));
  }

  @Post()
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new customer [Admin]" })
  @ApiResponse({ status: 201, description: "Customer created" })
  async create(@Body(ZodValidationPipe) dto: CreateCustomerDto) {
    return this.commandBus.execute(
      new CreateCustomerCommand(null, dto.email, dto.name, dto.phone),
    );
  }

  @Put("me")
  @Roles("customer")
  @ApiOperation({ summary: "Update current customer profile [Customer]" })
  @ApiResponse({ status: 200, description: "Profile updated" })
  async updateMyProfile(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: UpdateCustomerDto,
  ) {
    return this.commandBus.execute(
      new UpdateCustomerCommand(user.userId, dto.name, dto.phone),
    );
  }

  @Patch("me/address")
  @Roles("customer")
  @ApiOperation({ summary: "Update current customer delivery address [Customer]" })
  @ApiResponse({ status: 200, description: "Address updated" })
  async updateMyAddress(
    @User() user: RequestUser,
    @Body(ZodValidationPipe) dto: UpdateAddressDto,
  ) {
    return this.commandBus.execute(
      new UpdateCustomerAddressCommand(user.userId, dto.address),
    );
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update customer by ID [Admin]" })
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

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
import { CreateMenuItemDto, UpdateMenuItemDto } from "../dtos/menu-item.dto";
import { CreateMenuItemCommand } from "../../application/commands/create-menu-item/create-menu-item.command";
import { UpdateMenuItemCommand } from "../../application/commands/update-menu-item/update-menu-item.command";
import { DeleteMenuItemCommand } from "../../application/commands/delete-menu-item/delete-menu-item.command";
import { GetMenuItemsByRestaurantQuery } from "../../application/queries/get-menu-items-by-restaurant/get-menu-items-by-restaurant.query";

@ApiTags("Menu Items")
@Controller("restaurants/:restaurantId/menu")
export class MenuItemsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get menu items for a restaurant (public)" })
  @ApiResponse({ status: 200, description: "List of menu items" })
  async findByRestaurant(@Param("restaurantId") restaurantId: string) {
    return this.queryBus.execute(
      new GetMenuItemsByRestaurantQuery(restaurantId, true),
    );
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all menu items including unavailable (owner/admin)",
  })
  @ApiResponse({ status: 200, description: "List of all menu items" })
  async findAllByRestaurant(@Param("restaurantId") restaurantId: string) {
    return this.queryBus.execute(
      new GetMenuItemsByRestaurantQuery(restaurantId, false),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new menu item" })
  @ApiResponse({ status: 201, description: "Menu item created" })
  async create(
    @Param("restaurantId") restaurantId: string,
    @Body(ZodValidationPipe) dto: CreateMenuItemDto,
  ) {
    return this.commandBus.execute(
      new CreateMenuItemCommand(
        restaurantId,
        dto.name,
        dto.description,
        dto.price,
        dto.currency,
        dto.category,
        dto.imageUrl || null,
        dto.preparationTime,
      ),
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update menu item" })
  @ApiResponse({ status: 200, description: "Menu item updated" })
  async update(
    @Param("id") id: string,
    @Body(ZodValidationPipe) dto: UpdateMenuItemDto,
  ) {
    return this.commandBus.execute(
      new UpdateMenuItemCommand(
        id,
        dto.name,
        dto.description,
        dto.price,
        dto.currency,
        dto.category,
        dto.imageUrl || null,
        dto.preparationTime,
        dto.isAvailable,
      ),
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "restaurant_owner")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete menu item" })
  @ApiResponse({ status: 204, description: "Menu item deleted" })
  async delete(@Param("id") id: string) {
    return this.commandBus.execute(new DeleteMenuItemCommand(id));
  }
}

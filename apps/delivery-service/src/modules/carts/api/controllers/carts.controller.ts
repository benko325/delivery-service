import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../../shared-kernel/api/guards/jwt.guard';
import { RolesGuard } from '../../../shared-kernel/api/guards/roles.guard';
import { Roles } from '../../../shared-kernel/api/decorators/roles.decorator';
import { User } from '../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../shared-kernel/core/types/user-types';
import {
    AddItemToCartDto,
    UpdateItemQuantityDto,
    RemoveItemFromCartDto,
} from '../dto/cart.dto';
import { AddItemToCartCommand } from '../../application/commands/add-item-to-cart/add-item-to-cart.command';
import { RemoveItemFromCartCommand } from '../../application/commands/remove-item-from-cart/remove-item-from-cart.command';
import { UpdateItemQuantityCommand } from '../../application/commands/update-item-quantity/update-item-quantity.command';
import { ClearCartCommand } from '../../application/commands/clear-cart/clear-cart.command';
import { GetCartByCustomerIdQuery } from '../../application/queries/get-cart-by-customer-id/get-cart-by-customer-id.query';

@ApiTags('Carts')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@ApiBearerAuth()
export class CartsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get current customer cart' })
    @ApiResponse({ status: 200, description: 'Cart details' })
    async getMyCart(@User() user: RequestUser) {
        return this.queryBus.execute(new GetCartByCustomerIdQuery(user.userId));
    }

    @Post('items')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Add item to cart' })
    @ApiResponse({ status: 200, description: 'Item added to cart' })
    async addItem(
        @User() user: RequestUser,
        @Body(ZodValidationPipe) dto: AddItemToCartDto,
    ) {
        return this.commandBus.execute(
            new AddItemToCartCommand(
                user.userId,
                dto.menuItemId,
                dto.restaurantId,
                dto.name,
                dto.price,
                dto.currency,
                dto.quantity,
            ),
        );
    }

    @Patch('items')
    @ApiOperation({ summary: 'Update item quantity in cart' })
    @ApiResponse({ status: 200, description: 'Item quantity updated' })
    async updateItemQuantity(
        @User() user: RequestUser,
        @Body(ZodValidationPipe) dto: UpdateItemQuantityDto,
    ) {
        return this.commandBus.execute(
            new UpdateItemQuantityCommand(user.userId, dto.menuItemId, dto.quantity),
        );
    }

    @Delete('items')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiResponse({ status: 200, description: 'Item removed from cart' })
    async removeItem(
        @User() user: RequestUser,
        @Body(ZodValidationPipe) dto: RemoveItemFromCartDto,
    ) {
        return this.commandBus.execute(
            new RemoveItemFromCartCommand(user.userId, dto.menuItemId),
        );
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Clear cart' })
    @ApiResponse({ status: 200, description: 'Cart cleared' })
    async clearCart(@User() user: RequestUser) {
        return this.commandBus.execute(new ClearCartCommand(user.userId));
    }
}

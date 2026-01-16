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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../../shared-kernel/api/guards/jwt.guard';
import { RolesGuard } from '../../../shared-kernel/api/guards/roles.guard';
import { Roles } from '../../../shared-kernel/api/decorators/roles.decorator';
import { User } from '../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../shared-kernel/core/types/user-types';
import { CreateRestaurantDto, UpdateRestaurantDto } from '../dto/restaurant.dto';
import { CreateRestaurantCommand } from '../../application/commands/create-restaurant/create-restaurant.command';
import { UpdateRestaurantCommand } from '../../application/commands/update-restaurant/update-restaurant.command';
import { GetRestaurantByIdQuery } from '../../application/queries/get-restaurant-by-id/get-restaurant-by-id.query';
import { GetAllRestaurantsQuery } from '../../application/queries/get-all-restaurants/get-all-restaurants.query';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all active restaurants (public)' })
    @ApiResponse({ status: 200, description: 'List of active restaurants' })
    async findAll() {
        return this.queryBus.execute(new GetAllRestaurantsQuery(true));
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all restaurants including inactive (admin only)' })
    @ApiResponse({ status: 200, description: 'List of all restaurants' })
    async findAllIncludingInactive() {
        return this.queryBus.execute(new GetAllRestaurantsQuery(false));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get restaurant by ID (public)' })
    @ApiResponse({ status: 200, description: 'Restaurant details' })
    @ApiResponse({ status: 404, description: 'Restaurant not found' })
    async findById(@Param('id') id: string) {
        return this.queryBus.execute(new GetRestaurantByIdQuery(id));
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant_owner')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new restaurant' })
    @ApiResponse({ status: 201, description: 'Restaurant created' })
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

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant_owner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update restaurant' })
    @ApiResponse({ status: 200, description: 'Restaurant updated' })
    async update(
        @Param('id') id: string,
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
}

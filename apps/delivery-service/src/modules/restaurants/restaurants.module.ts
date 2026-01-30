import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { ConfigModule } from "@nestjs/config";

// Config
import { RestaurantConfigModule } from "./infrastructure/config/restaurant-config.module";
import { RestaurantConfigService } from "./infrastructure/config/restaurant-config.service";

// API
import { RestaurantsController } from "./api/controllers/restaurants.controller";
import { MenuItemsController } from "./api/controllers/menu-items.controller";

// Application - Commands
import { CreateRestaurantCommandHandler } from "./application/commands/create-restaurant/create-restaurant.handler";
import { UpdateRestaurantCommandHandler } from "./application/commands/update-restaurant/update-restaurant.handler";
import { ActivateRestaurantCommandHandler } from "./application/commands/activate-restaurant/activate-restaurant.handler";
import { DeactivateRestaurantCommandHandler } from "./application/commands/deactivate-restaurant/deactivate-restaurant.handler";
import { ConfirmOrderCommandHandler } from "./application/commands/confirm-order/confirm-order.handler";
import { RejectOrderCommandHandler } from "./application/commands/reject-order/reject-order.handler";
import { CreateMenuItemCommandHandler } from "./application/commands/create-menu-item/create-menu-item.handler";
import { UpdateMenuItemCommandHandler } from "./application/commands/update-menu-item/update-menu-item.handler";
import { DeleteMenuItemCommandHandler } from "./application/commands/delete-menu-item/delete-menu-item.handler";

// Application - Queries
import { GetRestaurantByIdQueryHandler } from "./application/queries/get-restaurant-by-id/get-restaurant-by-id.handler";
import { GetAllRestaurantsQueryHandler } from "./application/queries/get-all-restaurants/get-all-restaurants.handler";
import { GetMenuItemsByRestaurantQueryHandler } from "./application/queries/get-menu-items-by-restaurant/get-menu-items-by-restaurant.handler";

// Infrastructure
import { RestaurantRepository } from "./infrastructure/database/repositories/restaurant.repository";
import { RestaurantAggregateRepository } from "./infrastructure/database/repositories/restaurant-aggregate.repository";
import { MenuItemRepository } from "./infrastructure/database/repositories/menu-item.repository";
import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";

// Events
import { RestaurantCreatedEvent } from "./core/events/restaurant-created.event";
import { RestaurantDeactivatedEvent } from "./core/events/restaurant-deactivated.event";
import { OrderConfirmedByRestaurantEvent } from "./core/events/order-confirmed-by-restaurant.event";
import { OrderRejectedByRestaurantEvent } from "./core/events/order-rejected-by-restaurant.event";

const commandHandlers = [
  CreateRestaurantCommandHandler,
  UpdateRestaurantCommandHandler,
  ActivateRestaurantCommandHandler,
  DeactivateRestaurantCommandHandler,
  ConfirmOrderCommandHandler,
  RejectOrderCommandHandler,
  CreateMenuItemCommandHandler,
  UpdateMenuItemCommandHandler,
  DeleteMenuItemCommandHandler,
];

const queryHandlers = [
  GetRestaurantByIdQueryHandler,
  GetAllRestaurantsQueryHandler,
  GetMenuItemsByRestaurantQueryHandler,
];

const events = [
  RestaurantCreatedEvent,
  RestaurantDeactivatedEvent,
  OrderConfirmedByRestaurantEvent,
  OrderRejectedByRestaurantEvent,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    RestaurantConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [RestaurantConfigModule],
      inject: [RestaurantConfigService],
      useFactory: (configService: RestaurantConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [RestaurantsController, MenuItemsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: "IRestaurantRepository",
      useClass: RestaurantRepository,
    },
    {
      provide: "IRestaurantAggregateRepository",
      useClass: RestaurantAggregateRepository,
    },
    {
      provide: "IMenuItemRepository",
      useClass: MenuItemRepository,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
    {
      provide: "EVENTS",
      useValue: events,
    },
  ],
})
export class RestaurantsModule implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly rabbitMQPublisher: RabbitMQPublisher,
    private readonly rabbitMQSubscriber: RabbitMQSubscriber,
  ) {}

  async onModuleInit() {
    await this.rabbitMQSubscriber.connect();
    this.rabbitMQSubscriber.bridgeEventsTo(this.eventBus.subject$);
    this.rabbitMQPublisher.connect();
    this.eventBus.publisher = this.rabbitMQPublisher;
  }
}

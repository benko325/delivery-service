import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { ConfigModule } from "@nestjs/config";

// Config
import { CartConfigModule } from "./infrastructure/config/cart-config.module";
import { CartConfigService } from "./infrastructure/config/cart-config.service";

// API
import { CartsController } from "./api/controllers/carts.controller";

// Application - Commands
import { AddItemToCartCommandHandler } from "./application/commands/add-item-to-cart/add-item-to-cart.handler";
import { RemoveItemFromCartCommandHandler } from "./application/commands/remove-item-from-cart/remove-item-from-cart.handler";
import { UpdateItemQuantityCommandHandler } from "./application/commands/update-item-quantity/update-item-quantity.handler";
import { ClearCartCommandHandler } from "./application/commands/clear-cart/clear-cart.handler";
import { CheckoutCartCommandHandler } from "./application/commands/checkout-cart/checkout-cart.handler";

// Application - Queries
import { GetCartByCustomerIdQueryHandler } from "./application/queries/get-cart-by-customer-id/get-cart-by-customer-id.handler";

// Infrastructure
import { CartRepository } from "./infrastructure/database/repositories/cart.repository";
import { CartAggregateRepository } from "./infrastructure/database/repositories/cart-aggregate.repository";
import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";

// Events
import { CartOrderedEvent } from "./core/events/cart-ordered.event";

const commandHandlers = [
  AddItemToCartCommandHandler,
  RemoveItemFromCartCommandHandler,
  UpdateItemQuantityCommandHandler,
  ClearCartCommandHandler,
  CheckoutCartCommandHandler,
];

const queryHandlers = [GetCartByCustomerIdQueryHandler];

const events = [CartOrderedEvent];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    CartConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [CartConfigModule],
      inject: [CartConfigService],
      useFactory: (configService: CartConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [CartsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: "ICartRepository",
      useClass: CartRepository,
    },
    {
      provide: "ICartAggregateRepository",
      useClass: CartAggregateRepository,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
    {
      provide: "EVENTS",
      useValue: events,
    },
  ],
})
export class CartsModule implements OnModuleInit {
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

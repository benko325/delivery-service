import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { ConfigModule } from "@nestjs/config";

// Config
import { OrderConfigModule } from "./infrastructure/config/order-config.module";
import { OrderConfigService } from "./infrastructure/config/order-config.service";

// API
import { OrdersController } from "./api/controllers/orders.controller";

// Application - Commands
import { CreateOrderCommandHandler } from "./application/commands/create-order/create-order.handler";
import { AcceptOrderCommandHandler } from "./application/commands/accept-order/accept-order.handler";
import { UpdateOrderStatusCommandHandler } from "./application/commands/update-order-status/update-order-status.handler";
import { CancelOrderCommandHandler } from "./application/commands/cancel-order/cancel-order.handler";

// Application - Queries
import { GetOrderByIdQueryHandler } from "./application/queries/get-order-by-id/get-order-by-id.handler";
import { GetOrdersByCustomerQueryHandler } from "./application/queries/get-orders-by-customer/get-orders-by-customer.handler";
import { GetAvailableOrdersQueryHandler } from "./application/queries/get-available-orders/get-available-orders.handler";
import { GetOrdersByDriverQueryHandler } from "./application/queries/get-orders-by-driver/get-orders-by-driver.handler";
import { CartOrderedEventHandler } from "./application/events/cart-ordered.handler";

// Infrastructure
import { OrderRepository } from "./infrastructure/database/repositories/order.repository";
import { OrderAggregateRepository } from "./infrastructure/database/repositories/order-aggregate.repository";
import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";
import { CartOrderedMappedEvent } from "./infrastructure/anti-corruption-layer/cart-ordered.mapper";

const commandHandlers = [
  CreateOrderCommandHandler,
  AcceptOrderCommandHandler,
  UpdateOrderStatusCommandHandler,
  CancelOrderCommandHandler,
];

const queryHandlers = [
  GetOrderByIdQueryHandler,
  GetOrdersByCustomerQueryHandler,
  GetAvailableOrdersQueryHandler,
  GetOrdersByDriverQueryHandler,
];

const eventHandlers = [CartOrderedEventHandler];

const events = [CartOrderedMappedEvent];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    OrderConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [OrderConfigModule],
      inject: [OrderConfigService],
      useFactory: (configService: OrderConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    {
      provide: "IOrderRepository",
      useClass: OrderRepository,
    },
    {
      provide: "IOrderAggregateRepository",
      useClass: OrderAggregateRepository,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
    {
      provide: "EVENTS",
      useValue: events,
    },
  ],
})
export class OrdersModule implements OnModuleInit {
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

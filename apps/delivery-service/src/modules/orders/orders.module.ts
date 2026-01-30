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
import { PayForOrderCommandHandler } from "./application/commands/pay-for-order/pay-for-order.handler";

// Application - Queries
import { GetOrderByIdQueryHandler } from "./application/queries/get-order-by-id/get-order-by-id.handler";
import { GetOrdersByCustomerQueryHandler } from "./application/queries/get-orders-by-customer/get-orders-by-customer.handler";
import { GetAvailableOrdersQueryHandler } from "./application/queries/get-available-orders/get-available-orders.handler";
import { GetOrdersByDriverQueryHandler } from "./application/queries/get-orders-by-driver/get-orders-by-driver.handler";

// Application - Events
import { CartOrderedEventHandler } from "./application/events/cart-ordered.handler";
import { PaymentSucceededEventHandler } from "./application/events/payment-succeeded.handler";

// Infrastructure - Anti-Corruption Layer
import { CartOrderedEventMapper } from "./infrastructure/anti-corruption-layer/cart-ordered.mapper";

// Infrastructure - Services
import { PaymentGatewayService } from "./infrastructure/services/payment-gateway.service";

// Infrastructure
import { OrderRepository } from "./infrastructure/database/repositories/order.repository";
import { OrderAggregateRepository } from "./infrastructure/database/repositories/order-aggregate.repository";
import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";
import { CartOrderedMappedEvent } from "./infrastructure/anti-corruption-layer/cart-ordered.mapper";

// Events
import { PaymentSucceededEvent } from "./core/events/payment-succeeded.event";

const commandHandlers = [
  CreateOrderCommandHandler,
  AcceptOrderCommandHandler,
  UpdateOrderStatusCommandHandler,
  CancelOrderCommandHandler,
  PayForOrderCommandHandler,
];

const queryHandlers = [
  GetOrderByIdQueryHandler,
  GetOrdersByCustomerQueryHandler,
  GetAvailableOrdersQueryHandler,
  GetOrdersByDriverQueryHandler,
];

const eventHandlers = [CartOrderedEventHandler, PaymentSucceededEventHandler];

const events = [CartOrderedMappedEvent, PaymentSucceededEvent];

const antiCorruptionLayer = [CartOrderedEventMapper];

const infrastructureServices = [PaymentGatewayService];

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
    ...antiCorruptionLayer,
    ...infrastructureServices,
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
      provide: "IPaymentGatewayService",
      useClass: PaymentGatewayService,
    },
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

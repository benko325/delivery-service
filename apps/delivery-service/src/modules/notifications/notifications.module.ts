import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { ConfigModule } from "@nestjs/config";

// Config
import { NotificationConfigModule } from "./infrastructure/config/notification-config.module";
import { NotificationConfigService } from "./infrastructure/config/notification-config.service";

// Application - Commands
import { SendRestaurantNotificationCommandHandler } from "./application/commands/send-restaurant-notification/send-restaurant-notification.handler";
import { SendCustomerNotificationCommandHandler } from "./application/commands/send-customer-notification/send-customer-notification.handler";

// Application - Events
import { PaymentSucceededEventHandler } from "./application/events/payment-succeeded.handler";
import { OrderStatusChangedEventHandler } from "./application/events/order-status-changed.handler";

// Infrastructure - Anti-Corruption Layer
import { PaymentSucceededEventMapper } from "./infrastructure/anti-corruption-layer/payment-succeeded.mapper";
import { OrderStatusChangedEventMapper } from "./infrastructure/anti-corruption-layer/order-status-changed.mapper";
import { PaymentSucceededMappedEvent } from "./infrastructure/anti-corruption-layer/payment-succeeded.mapper";
import { OrderStatusChangedMappedEvent } from "./infrastructure/anti-corruption-layer/order-status-changed.mapper";

// Infrastructure - Services
import { OrderDataService } from "./infrastructure/services/order-data.service";

import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";

const commandHandlers = [
  SendRestaurantNotificationCommandHandler,
  SendCustomerNotificationCommandHandler,
];

const eventHandlers = [
  PaymentSucceededEventHandler,
  OrderStatusChangedEventHandler,
];

const events = [PaymentSucceededMappedEvent, OrderStatusChangedMappedEvent];

const antiCorruptionLayer = [
  PaymentSucceededEventMapper,
  OrderStatusChangedEventMapper,
];

const infrastructureServices = [OrderDataService];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    NotificationConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [NotificationConfigModule],
      inject: [NotificationConfigService],
      useFactory: (configService: NotificationConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...antiCorruptionLayer,
    ...infrastructureServices,
    RabbitMQPublisher,
    RabbitMQSubscriber,
    {
      provide: "EVENTS",
      useValue: events,
    },
  ],
})
export class NotificationsModule implements OnModuleInit {
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

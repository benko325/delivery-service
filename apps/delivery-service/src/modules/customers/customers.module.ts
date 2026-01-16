import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';

// Config
import { CustomerConfigModule } from './infrastructure/config/customer-config.module';
import { CustomerConfigService } from './infrastructure/config/customer-config.service';

// API
import { CustomersController } from './api/controllers/customers.controller';

// Application - Commands
import { CreateCustomerCommandHandler } from './application/commands/create-customer/create-customer.handler';
import { UpdateCustomerCommandHandler } from './application/commands/update-customer/update-customer.handler';
import { UpdateCustomerAddressCommandHandler } from './application/commands/update-customer-address/update-customer-address.handler';

// Application - Queries
import { GetCustomerByIdQueryHandler } from './application/queries/get-customer-by-id/get-customer-by-id.handler';
import { GetAllCustomersQueryHandler } from './application/queries/get-all-customers/get-all-customers.handler';

// Application - Events (Anti-corruption layer)
import { UserRegisteredEventHandler } from './application/events/user-registered.mapper';

// Infrastructure
import { CustomerRepository } from './infrastructure/database/repositories/customer.repository';
import { CustomerAggregateRepository } from './infrastructure/database/repositories/customer-aggregate.repository';
import { RabbitMQPublisher, RabbitMQSubscriber } from '../shared-kernel';

// Events
import { UserRegisteredEvent } from '../auth/core/events/user-registered.event';

const commandHandlers = [
    CreateCustomerCommandHandler,
    UpdateCustomerCommandHandler,
    UpdateCustomerAddressCommandHandler,
];

const queryHandlers = [
    GetCustomerByIdQueryHandler,
    GetAllCustomersQueryHandler,
];

const eventHandlers = [UserRegisteredEventHandler];

const events = [UserRegisteredEvent];

@Module({
    imports: [
        CqrsModule,
        ConfigModule,
        CustomerConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [CustomerConfigModule],
            inject: [CustomerConfigService],
            useFactory: (configService: CustomerConfigService) => ({
                uri: configService.rabbitmqUri,
                connectionInitOptions: { wait: false },
            }),
        }),
    ],
    controllers: [CustomersController],
    providers: [
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
        {
            provide: 'ICustomerRepository',
            useClass: CustomerRepository,
        },
        {
            provide: 'ICustomerAggregateRepository',
            useClass: CustomerAggregateRepository,
        },
        RabbitMQPublisher,
        RabbitMQSubscriber,
        {
            provide: 'EVENTS',
            useValue: events,
        },
    ],
})
export class CustomersModule implements OnModuleInit {
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

import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';

// Config
import { DriverConfigModule } from './infrastructure/config/driver-config.module';
import { DriverConfigService } from './infrastructure/config/driver-config.service';

// API
import { DriversController } from './api/controllers/drivers.controller';

// Application - Commands
import { CreateDriverCommandHandler } from './application/commands/create-driver/create-driver.handler';
import { UpdateDriverCommandHandler } from './application/commands/update-driver/update-driver.handler';
import { UpdateDriverLocationCommandHandler } from './application/commands/update-driver-location/update-driver-location.handler';
import { SetDriverAvailabilityCommandHandler } from './application/commands/set-driver-availability/set-driver-availability.handler';

// Application - Queries
import { GetDriverByIdQueryHandler } from './application/queries/get-driver-by-id/get-driver-by-id.handler';
import { GetAllDriversQueryHandler } from './application/queries/get-all-drivers/get-all-drivers.handler';
import { GetAvailableDriversQueryHandler } from './application/queries/get-available-drivers/get-available-drivers.handler';

// Infrastructure
import { DriverRepository } from './infrastructure/database/repositories/driver.repository';
import { DriverAggregateRepository } from './infrastructure/database/repositories/driver-aggregate.repository';
import { RabbitMQPublisher, RabbitMQSubscriber } from '../shared-kernel';

const commandHandlers = [
    CreateDriverCommandHandler,
    UpdateDriverCommandHandler,
    UpdateDriverLocationCommandHandler,
    SetDriverAvailabilityCommandHandler,
];

const queryHandlers = [
    GetDriverByIdQueryHandler,
    GetAllDriversQueryHandler,
    GetAvailableDriversQueryHandler,
];

const events: never[] = [];

@Module({
    imports: [
        CqrsModule,
        ConfigModule,
        DriverConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [DriverConfigModule],
            inject: [DriverConfigService],
            useFactory: (configService: DriverConfigService) => ({
                uri: configService.rabbitmqUri,
                connectionInitOptions: { wait: false },
            }),
        }),
    ],
    controllers: [DriversController],
    providers: [
        ...commandHandlers,
        ...queryHandlers,
        {
            provide: 'IDriverRepository',
            useClass: DriverRepository,
        },
        {
            provide: 'IDriverAggregateRepository',
            useClass: DriverAggregateRepository,
        },
        RabbitMQPublisher,
        RabbitMQSubscriber,
        {
            provide: 'EVENTS',
            useValue: events,
        },
    ],
})
export class DriversModule implements OnModuleInit {
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

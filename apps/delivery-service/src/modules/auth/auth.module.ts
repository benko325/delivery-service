import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { ConfigModule } from "@nestjs/config";

// Config
import { AuthConfigModule } from "./infrastructure/config/auth-config.module";
import { AuthConfigService } from "./infrastructure/config/auth-config.service";

// API
import { AuthController } from "./api/controllers/auth.controller";

// Application - Commands
import { RegisterCommandHandler } from "./application/commands/register/register.handler";
import { LoginCommandHandler } from "./application/commands/login/login.handler";
import { RefreshTokenCommandHandler } from "./application/commands/refresh-token/refresh-token.handler";
import { UpdateUserRoleCommandHandler } from "./application/commands/update-user-role/update-user-role.handler";

// Infrastructure
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { AuthRepository } from "./infrastructure/database/repositories/auth.repository";
import { RabbitMQPublisher, RabbitMQSubscriber } from "../shared-kernel";

// Events
import { UserRegisteredEvent } from "./core/events/user-registered.event";

const commandHandlers = [
  RegisterCommandHandler,
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  UpdateUserRoleCommandHandler,
];

const events = [UserRegisteredEvent];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    AuthConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (configService: AuthConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        } as JwtSignOptions,
      }),
    }),
    RabbitMQModule.forRootAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (configService: AuthConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    JwtStrategy,
    {
      provide: "IAuthRepository",
      useClass: AuthRepository,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
    {
      provide: "EVENTS",
      useValue: events,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule implements OnModuleInit {
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

import { Injectable } from "@nestjs/common";
import { IEvent, IEventPublisher } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectPinoLogger(RabbitMQPublisher.name)
    private readonly logger: PinoLogger,
  ) {}

  async publish<T extends IEvent>(event: T): Promise<void> {
    const eventName = event.constructor.name;
    const payload = JSON.stringify(event);

    try {
      await this.amqpConnection.publish("", eventName, payload);
      this.logger.debug(`Published event: ${eventName}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventName}:`, error);
      throw error;
    }
  }

  connect(): void {
    this.logger.info("RabbitMQ Publisher connected");
  }
}

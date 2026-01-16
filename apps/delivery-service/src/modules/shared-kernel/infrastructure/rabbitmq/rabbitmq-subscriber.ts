import { Injectable, Inject, Logger } from '@nestjs/common';
import { IEvent, IMessageSource } from '@nestjs/cqrs';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Subject } from 'rxjs';

export type EventConstructor<T extends IEvent> = new (payload: unknown) => T;

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
    private readonly logger = new Logger(RabbitMQSubscriber.name);
    private bridge: Subject<unknown> = new Subject();

    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject('EVENTS')
        private readonly events: Array<EventConstructor<IEvent>>,
    ) {}

    async connect(): Promise<void> {
        for (const Event of this.events) {
            try {
                await this.amqpConnection.createSubscriber<string>(
                    async (message) => {
                        try {
                            if (!message) {
                                this.logger.warn(`Received empty message for ${Event.name}`);
                                return;
                            }
                            const parsedJson = JSON.parse(message);
                            const receivedEvent = new Event(parsedJson);
                            this.bridge.next(receivedEvent);
                            this.logger.debug(`Received event: ${Event.name}`);
                        } catch (error) {
                            this.logger.error(`Failed to process event ${Event.name}:`, error);
                        }
                    },
                    { queue: Event.name },
                    `handler_${Event.name}`,
                );
                this.logger.log(`Subscribed to queue: ${Event.name}`);
            } catch (error) {
                this.logger.error(`Failed to subscribe to ${Event.name}:`, error);
            }
        }
    }

    bridgeEventsTo<T extends IEvent>(subject: Subject<T>): void {
        this.bridge = subject as unknown as Subject<unknown>;
    }
}

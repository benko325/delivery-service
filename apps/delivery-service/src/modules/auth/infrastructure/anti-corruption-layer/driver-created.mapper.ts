import { EventsHandler, IEventHandler, EventBus, IEvent } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
// import the real external event published by Drivers BC
import { DriverCreatedEvent as ExternalDriverCreatedEvent } from "../../../drivers/core/events/driver-created.event";

/**
 * Internal mapped event that Auth BC will handle.
 */
export class DriverCreatedMappedEvent implements IEvent {
  constructor(
    // keep original id (driver id) and also expose userId for Auth handlers that expect that name
    public readonly id: string,
    public readonly fullName: string,
    public readonly userId?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly vehicleRegistration?: string,
    public readonly vehicleModel?: string,
    public readonly location?: { lat: number; lon: number },
    public readonly registeredAt?: Date,
  ) {}
}

@EventsHandler(ExternalDriverCreatedEvent)
export class DriverCreatedEventMapper
  implements IEventHandler<ExternalDriverCreatedEvent>
{
  private readonly logger = new Logger(DriverCreatedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: ExternalDriverCreatedEvent): void {
    const driverId = event.id;
    const userId = event.userId;
    const fullName = "";
    const email = undefined;
    const phone = undefined;
    const vehicleRegistration = undefined;
    const vehicleModel = undefined;
    const location = undefined;
    const registeredAt = event.createdAt;

    this.logger.log(
      `Mapping external DriverCreated event -> driverId=${driverId} userId=${userId ?? "<missing>"}`,
    );

    const mapped = new DriverCreatedMappedEvent(
      driverId,
      fullName,
      userId,
      email,
      phone,
      vehicleRegistration,
      vehicleModel,
      location,
      registeredAt ? new Date(registeredAt) : undefined,
    );

    if (!userId) {
      this.logger.warn(
        `Mapped event has no userId — will not attempt to create user, handler should skip assignment.`,
      );
    }

    // deliver locally to Auth BC handlers (do not re-publish to Rabbit)
    this.eventBus.subject$.next(mapped);

    this.logger.log(
      `Published mapped DriverCreatedMappedEvent -> driverId=${driverId} userId=${userId ?? "<missing>"}`,
    );
  }
}

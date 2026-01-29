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
    const raw = event as unknown as Record<string, unknown>;

    const driverId =
      (typeof raw["driverId"] === "string" && (raw["driverId"] as string)) ||
      (typeof raw["id"] === "string" && (raw["id"] as string)) ||
      (raw["id"] &&
      typeof raw["id"] === "object" &&
      typeof (raw["id"] as Record<string, unknown>)["driverId"] === "string"
        ? ((raw["id"] as Record<string, unknown>)["driverId"] as string)
        : "") ||
      "";

    let userId: string | undefined = undefined;
    if (typeof raw["userId"] === "string") {
      userId = raw["userId"] as string;
    } else if (
      raw["id"] &&
      typeof raw["id"] === "object" &&
      typeof (raw["id"] as Record<string, unknown>)["userId"] === "string"
    ) {
      userId = (raw["id"] as Record<string, unknown>)["userId"] as string;
    } else if (
      raw["payload"] &&
      typeof raw["payload"] === "object" &&
      typeof (raw["payload"] as Record<string, unknown>)["userId"] === "string"
    ) {
      userId = (raw["payload"] as Record<string, unknown>)["userId"] as string;
    }

    const firstName =
      ((raw["firstName"] ?? raw["name"]) as string | undefined) ?? "";
    const lastName = (raw["lastName"] ?? "") as string;
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || "";

    const email =
      (raw["contact"] && typeof raw["contact"] === "object"
        ? ((raw["contact"] as Record<string, unknown>)["email"] as
            | string
            | undefined)
        : undefined) ?? (raw["email"] as string | undefined);
    const phone =
      (raw["contact"] && typeof raw["contact"] === "object"
        ? ((raw["contact"] as Record<string, unknown>)["phone"] as
            | string
            | undefined)
        : undefined) ?? (raw["phone"] as string | undefined);
    const vehicleRegistration =
      (raw["vehicle"] && typeof raw["vehicle"] === "object"
        ? ((raw["vehicle"] as Record<string, unknown>)["registration"] as
            | string
            | undefined)
        : undefined) ?? undefined;
    const vehicleModel =
      (raw["vehicle"] && typeof raw["vehicle"] === "object"
        ? ((raw["vehicle"] as Record<string, unknown>)["model"] as
            | string
            | undefined)
        : undefined) ?? undefined;
    const location =
      raw["lastKnownLocation"] && typeof raw["lastKnownLocation"] === "object"
        ? {
            lat: (raw["lastKnownLocation"] as Record<string, unknown>)[
              "lat"
            ] as number,
            lon: (raw["lastKnownLocation"] as Record<string, unknown>)[
              "lon"
            ] as number,
          }
        : undefined;
    const registeredAt = (raw["createdAt"] ?? raw["registeredAt"]) as
      | string
      | undefined;

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

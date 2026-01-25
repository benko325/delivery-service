import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { DriverCreatedEvent } from "../../../../drivers/core/events/driver-created.event";

// small local typings to avoid `any`
interface AuthUser {
  id: string;
  roles?: string[];
  // other fields if needed
}

interface IAuthRepository {
  findById(id: string): Promise<AuthUser | null>;
  addRole(id: string, role: string): Promise<unknown>;
}

@EventsHandler(DriverCreatedEvent)
export class DriverCreatedHandler implements IEventHandler<DriverCreatedEvent> {
  private readonly logger = new Logger(DriverCreatedHandler.name);

  constructor(
    @Inject("IAuthRepository")
    private readonly userRepository: IAuthRepository,
  ) {}

  private resolveUserId(event: unknown): string | number | undefined {
    if (typeof event !== "object" || event === null) return undefined;
    const e = event as Record<string, unknown>;

    // if id is an object, try nested userId fields
    const idField = e["id"];
    if (idField && typeof idField === "object") {
      const idObj = idField as Record<string, unknown>;
      const nested = idObj["userId"] ?? idObj["user_id"] ?? idObj["id"];
      if (typeof nested === "string" || typeof nested === "number")
        return nested;
    }

    // flat locations
    const candidates = [
      e["userId"],
      e["user_id"],
      e["driverId"],
      e["driver"] && typeof e["driver"] === "object"
        ? (e["driver"] as Record<string, unknown>)["userId"]
        : undefined,
      e["driver"] && typeof e["driver"] === "object"
        ? (e["driver"] as Record<string, unknown>)["user_id"]
        : undefined,
      e["payload"] && typeof e["payload"] === "object"
        ? (e["payload"] as Record<string, unknown>)["userId"]
        : undefined,
      e["payload"] && typeof e["payload"] === "object"
        ? (e["payload"] as Record<string, unknown>)["user_id"]
        : undefined,
    ];
    for (const c of candidates) {
      if (typeof c === "string" || typeof c === "number") return c;
    }
    return undefined;
  }

  async handle(event: DriverCreatedEvent) {
    try {
      const userId = this.resolveUserId(event);
      if (!userId) {
        this.logger.warn(
          "DriverCreatedEvent received but no userId could be resolved",
          event,
        );
        return;
      }

      // userId should now be a primitive (string/uuid) — avoid interpolating objects into the message
      this.logger.debug(`Handling DriverCreatedEvent for userId=${userId}`);

      const user = await this.userRepository.findById(String(userId));
      if (!user) {
        this.logger.warn(
          `No user found for id=${userId}; cannot add 'driver' role`,
        );
        return;
      }

      // If repository provides roles on the user object, avoid duplicate adds
      const hasDriverRole =
        Array.isArray(user.roles) && user.roles.includes("driver");
      if (hasDriverRole) {
        this.logger.debug(`User ${userId} already has 'driver' role`);
        return;
      }

      // Attempt to add role and log outcome
      const result = await this.userRepository.addRole(
        String(userId),
        "driver",
      );
      this.logger.debug(`addRole result for user ${userId}`, result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error && err.stack ? err.stack : undefined;
      this.logger.error(
        `Failed to process DriverCreatedEvent: ${message}`,
        stack,
      );
      throw err;
    }
  }
}

import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger, Inject } from "@nestjs/common";

// listen for the internal mapped event produced by the ACL
import { DriverCreatedMappedEvent } from "../../../infrastructure/anti-corruption-layer/driver-created.mapper";

@EventsHandler(DriverCreatedMappedEvent)
export class DriverCreatedHandler
  implements IEventHandler<DriverCreatedMappedEvent>
{
  private readonly logger = new Logger(DriverCreatedHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject("IAuthRepository") private readonly authRepository: unknown,
  ) {}

  // helper to safely extract error message
  private getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  async handle(event: DriverCreatedMappedEvent): Promise<void> {
    this.logger.log(
      `DriverCreatedMappedEvent received (id=${event.id} userId=${event.userId} email=${event.email})`,
    );

    const tryFind = async (): Promise<Record<string, unknown> | null> => {
      const repo = this.authRepository as Record<string, unknown> | undefined;

      if (repo && typeof repo["findByUserId"] === "function") {
        try {
          const fn = repo["findByUserId"] as (
            userId?: unknown,
          ) => Promise<unknown> | unknown;
          const u = await fn.call(repo, event.userId);
          if (u) return u as Record<string, unknown>;
        } catch (err: unknown) {
          this.logger.debug(
            `findByUserId failed: ${this.getErrorMessage(err)}`,
          );
        }
      }

      if (repo && typeof repo["findById"] === "function") {
        try {
          const fn = repo["findById"] as (
            id?: unknown,
          ) => Promise<unknown> | unknown;
          const u = await fn.call(repo, event.userId);
          if (u) return u as Record<string, unknown>;
        } catch (err: unknown) {
          this.logger.debug(
            `findById by userId failed: ${this.getErrorMessage(err)}`,
          );
        }
      }

      if (event.email && repo && typeof repo["findByEmail"] === "function") {
        try {
          const fn = repo["findByEmail"] as (
            email?: unknown,
          ) => Promise<unknown> | unknown;
          const u = await fn.call(repo, event.email);
          if (u) return u as Record<string, unknown>;
        } catch (err: unknown) {
          this.logger.debug(`findByEmail failed: ${this.getErrorMessage(err)}`);
        }
      }

      if (event.email && repo && typeof repo["findByUsername"] === "function") {
        try {
          const fn = repo["findByUsername"] as (
            username?: unknown,
          ) => Promise<unknown> | unknown;
          const u = await fn.call(repo, event.email);
          if (u) return u as Record<string, unknown>;
        } catch (err: unknown) {
          this.logger.debug(
            `findByUsername failed: ${this.getErrorMessage(err)}`,
          );
        }
      }

      return null;
    };

    const existingUser = await tryFind();

    if (!existingUser) {
      this.logger.warn(
        `User for driver id=${event.id} / userId=${event.userId} not found by repository. Will NOT create user or assign role.`,
      );
      return;
    }

    // normalize current roles to string[]
    let currentRoles: string[] = [];
    try {
      if (Array.isArray(existingUser.roles)) {
        currentRoles = existingUser.roles as string[];
      } else if (typeof existingUser.roles === "string") {
        try {
          const parsed = JSON.parse(existingUser.roles as string);
          currentRoles = Array.isArray(parsed)
            ? parsed
            : (existingUser.roles as string).split(",").map((r) => r.trim());
        } catch {
          currentRoles = (existingUser.roles as string)
            .split(",")
            .map((r) => r.trim());
        }
      } else {
        currentRoles = [];
      }
    } catch (err: unknown) {
      this.logger.debug(
        `Error normalizing roles: ${this.getErrorMessage(err)}`,
      );
      currentRoles = [];
    }

    if (currentRoles.includes("driver")) {
      this.logger.log(
        `User ${existingUser.id ?? event.userId} already has role 'driver'.`,
      );
      return;
    }

    const mergedRoles = Array.from(new Set([...currentRoles, "driver"]));

    try {
      const repo = this.authRepository as Record<string, unknown> | undefined;

      if (repo && typeof repo["addRole"] === "function") {
        const fn = repo["addRole"] as (
          userId: unknown,
          role: unknown,
        ) => Promise<unknown> | unknown;
        await fn.call(repo, existingUser!.id ?? event.userId, "driver");
        this.logger.log(
          `Added 'driver' role via addRole to user ${existingUser!.id ?? event.userId}`,
        );
        return;
      }

      if (repo && typeof repo["updateRoles"] === "function") {
        const fn = repo["updateRoles"] as (
          userId: unknown,
          roles: unknown,
        ) => Promise<unknown> | unknown;
        await fn.call(repo, existingUser!.id ?? event.userId, mergedRoles);
        this.logger.log(
          `Updated roles via updateRoles for user ${existingUser!.id ?? event.userId}`,
        );
        return;
      }

      if (repo && typeof repo["update"] === "function") {
        const fn = repo["update"] as (
          id: unknown,
          data: unknown,
        ) => Promise<unknown> | unknown;
        await fn.call(repo, existingUser!.id ?? event.userId, {
          roles: mergedRoles,
        });
        this.logger.log(
          `Updated roles via update for user ${existingUser!.id ?? event.userId}`,
        );
        return;
      }

      if (repo && typeof repo["save"] === "function") {
        const fn = repo["save"] as (
          user: unknown,
        ) => Promise<unknown> | unknown;
        const userToSave = {
          ...(existingUser as Record<string, unknown>),
          roles: mergedRoles,
        };
        await fn.call(repo, userToSave);
        this.logger.log(
          `Updated roles via save for user ${existingUser!.id ?? event.userId}`,
        );
        return;
      }

      // No supported persistence API found — log error and do NOT create user.
      this.logger.error(
        `Cannot persist updated roles for user ${existingUser.id ?? event.userId}: authRepository does not expose addRole/updateRoles/update/save.`,
      );
    } catch (err: unknown) {
      this.logger.error(
        `Failed to persist role 'driver' for user ${existingUser?.id ?? event.userId}: ${this.getErrorMessage(err)}`,
      );
    }
  }
}

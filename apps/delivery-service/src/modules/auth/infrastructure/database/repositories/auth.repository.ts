import { Injectable, Inject } from "@nestjs/common";
import { Kysely, sql } from "kysely";
import {
  IAuthRepository,
  AuthUser,
  CreateAuthUserDto,
} from "../../../core/repositories/auth.repository.interface";
import { AuthDatabase } from "../../../core/types/auth-database.types";

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private readonly db: Kysely<AuthDatabase>,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.db
      .selectFrom("auth.users")
      .selectAll()
      .where("email", "=", email.toLowerCase())
      .executeTakeFirst();

    return user ? this.mapToAuthUser(user) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.db
      .selectFrom("auth.users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return user ? this.mapToAuthUser(user) : null;
  }

  async create(dto: CreateAuthUserDto): Promise<AuthUser> {
    const result = await this.db
      .insertInto("auth.users")
      .values({
        id: dto.id,
        email: dto.email.toLowerCase(),
        password: dto.password,
        roles: sql`${JSON.stringify(dto.roles)}::jsonb`,
        refreshToken: null,
      } as never)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToAuthUser(result);
  }

  async addRole(userId: string, role: string): Promise<void> {
    await this.db
      .updateTable("auth.users")
      .set({
        roles: sql`
                CASE
                WHEN roles @> ${JSON.stringify([role])}::jsonb
                THEN roles
                ELSE roles || ${JSON.stringify([role])}::jsonb
                END
            `,
        updatedAt: new Date(),
      } as never)
      .where("id", "=", userId)
      .execute();
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.db
      .updateTable("auth.users")
      .set({
        refreshToken,
        updatedAt: new Date(),
      } as never)
      .where("id", "=", id)
      .execute();
  }

  private mapToAuthUser(row: unknown): AuthUser {
    const data = row as Record<string, unknown>;
    return {
      id: data.id as string,
      email: data.email as string,
      password: data.password as string,
      roles: (typeof data.roles === "string"
        ? JSON.parse(data.roles)
        : data.roles) as AuthUser["roles"],
      refreshToken: data.refreshToken as string | null,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }
}

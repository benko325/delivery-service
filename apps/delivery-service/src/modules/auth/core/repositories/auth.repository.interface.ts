import { UserRole } from "../../../shared-kernel/core/types/user-types";

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  roles: UserRole[];
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthUserDto {
  id: string;
  email: string;
  password: string;
  roles: UserRole[];
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  create(dto: CreateAuthUserDto): Promise<AuthUser>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
  updateRole(id: string, roles: UserRole[]): Promise<void>;
}

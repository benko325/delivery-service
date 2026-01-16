import { Generated } from 'kysely';
import { UserRole } from '../../../shared-kernel/core/types/user-types';

export interface AuthUsersTable {
    id: Generated<string>;
    email: string;
    password: string;
    roles: UserRole[];
    refreshToken: string | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export interface AuthDatabase {
    'auth.users': AuthUsersTable;
}

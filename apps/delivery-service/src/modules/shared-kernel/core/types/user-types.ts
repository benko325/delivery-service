export type UserRole = 'admin' | 'customer' | 'driver' | 'restaurant_owner';

export type RequestUser = {
    userId: string;
    email: string;
    roles: UserRole[];
};

export type UserWithRoles = {
    id: string;
    email: string;
    roles: UserRole[];
};

export type JwtPayload = {
    sub: string;
    email: string;
    roles: UserRole[];
    iat?: number;
    exp?: number;
};

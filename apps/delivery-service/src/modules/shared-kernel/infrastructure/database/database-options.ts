export const DATABASE_OPTIONS = Symbol('DATABASE_OPTIONS');

export interface DatabaseOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    schema?: string;
}

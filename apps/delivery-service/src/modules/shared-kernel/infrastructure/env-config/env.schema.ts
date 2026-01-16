import { z } from 'zod';

export const baseEnvSchema = z.object({
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('localhost'),
});

export const postgresEnvSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
});

export const jwtEnvSchema = z.object({
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export const rabbitmqEnvSchema = z.object({
    RABBITMQ_HOST: z.string(),
    RABBITMQ_PORT: z.coerce.number(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASSWORD: z.string(),
    RABBITMQ_URI: z.string(),
});

export const fullEnvSchema = baseEnvSchema
    .merge(postgresEnvSchema)
    .merge(jwtEnvSchema)
    .merge(rabbitmqEnvSchema);

export type FullEnvConfig = z.infer<typeof fullEnvSchema>;
export type PostgresEnvConfig = z.infer<typeof postgresEnvSchema>;
export type JwtEnvConfig = z.infer<typeof jwtEnvSchema>;
export type RabbitMQEnvConfig = z.infer<typeof rabbitmqEnvSchema>;

# ADR-008: Zod for Runtime Validation

## Status
**Accepted** - 2025-01-16

## Context

We need to validate incoming HTTP requests to ensure data integrity and provide meaningful error messages. NestJS traditionally uses `class-validator` with decorators.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **class-validator** | NestJS native, decorators | Runtime reflection, verbose |
| **Joi** | Mature, flexible | Separate type definitions needed |
| **Zod** | Type inference, composable, no decorators | Newer, different pattern |
| **io-ts** | Functional, type-safe | Complex syntax, steep learning |

## Decision

We will use **Zod** with `nestjs-zod` for validation because:

1. **Type inference** - Schema defines both validation and TypeScript type
2. **No decorators** - Cleaner code without experimental decorators
3. **Composable** - Schemas can be combined and reused
4. **Better errors** - Clear, customizable error messages
5. **Smaller bundle** - No reflection metadata needed

### Implementation

**Schema Definition:**
```typescript
// auth/api/dtos/auth.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(9, 'Phone must be at least 9 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// DTO classes auto-generated from schemas
export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
```

**Nested Schema Composition:**
```typescript
const deliveryAddressSchema = z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    instructions: z.string().optional(),
});

const orderItemSchema = z.object({
    menuItemId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    currency: z.string().length(3).default('EUR'),
});

export const createOrderSchema = z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    deliveryAddress: deliveryAddressSchema,
    deliveryFee: z.number().min(0).default(0),
    currency: z.string().length(3).default('EUR'),
});
```

**Environment Validation:**
```typescript
// shared-kernel/infrastructure/env-config/env.schema.ts
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
```

**Controller Usage:**
```typescript
@Controller('auth')
export class AuthController {
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        // dto is validated and typed
        return this.commandBus.execute(
            new RegisterCommand(dto.email, dto.password, dto.name, dto.phone)
        );
    }
}
```

## Consequences

### Positive
- **Single source of truth** - Schema = validation + types
- **Composable** - Build complex schemas from simple ones
- **Transformations** - Parse strings to numbers with `z.coerce`
- **Default values** - Built-in default support
- **Better DX** - TypeScript autocomplete from schemas

### Negative
- **Different pattern** - Not standard NestJS approach
- **Migration effort** - Existing class-validator code needs rewrite
- **Swagger integration** - Requires nestjs-zod for OpenAPI

### Mitigations
- Use nestjs-zod for seamless NestJS integration
- Document Zod patterns in team guidelines
- Create shared schema fragments for common fields

## References
- [Zod Documentation](https://zod.dev/)
- [nestjs-zod](https://github.com/risen228/nestjs-zod)

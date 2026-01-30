# ADR-009: JWT Authentication with Passport.js

## Status
**Accepted** - 2025-01-16

## Context

The application needs authentication for:
- Protecting API endpoints
- Identifying users for authorization
- Supporting different user roles (customer, driver, restaurant_owner, admin)

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Session-based** | Server controls sessions | Requires session storage, not stateless |
| **JWT** | Stateless, scalable | Token revocation complex, larger payload |
| **OAuth2** | Standard, third-party support | Complex setup for internal auth |
| **API Keys** | Simple | No user identity, hard to rotate |

## Decision

We will use **JWT (JSON Web Tokens)** with **Passport.js** strategy for authentication.

### Implementation

**JWT Strategy:**
```typescript
// auth/infrastructure/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly envService: EnvService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        return {
            userId: payload.sub,
            email: payload.email,
            roles: payload.roles,
        };
    }
}
```

**Token Generation:**
```typescript
// In AuthAggregate or LoginHandler
const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email, roles: user.roles },
    { expiresIn: '1h' }
);

const refreshToken = this.jwtService.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '7d' }
);
```

**Password Hashing:**
```typescript
// auth/core/aggregates/auth.aggregate.ts
private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

async validatePassword(password: string): Promise<boolean> {
    const [salt, storedHash] = this._password.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === storedHash;
}
```

**Guards and Decorators:**
```typescript
// JWT Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
        const user = request.user as RequestUser;
        return requiredRoles.some(role => user.roles.includes(role));
    }
}

// Decorators
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const User = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
```

**Controller Usage:**
```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    @Post()
    @Roles('customer')
    async createOrder(@User() user: RequestUser, @Body() dto: CreateOrderDto) {
        return this.commandBus.execute(
            new CreateOrderCommand(user.userId, dto.restaurantId, ...)
        );
    }

    @Get('available')
    @Roles('driver')
    async getAvailableOrders() {
        return this.queryBus.execute(new GetAvailableOrdersQuery());
    }
}
```

### Configuration
```
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Consequences

### Positive
- **Stateless** - No server-side session storage needed
- **Scalable** - Any server can validate tokens
- **Self-contained** - Token contains user info (id, roles)
- **Standard** - Well-understood, library support
- **Flexible** - Easy to add claims to payload

### Negative
- **Token size** - Larger than session ID
- **Revocation** - Cannot easily invalidate tokens (using refresh token workaround)
- **Secret management** - Must protect JWT secret

### Security Measures
- Minimum 32-character secret required (Zod validation)
- Short access token expiry (1 hour)
- Refresh token for extended sessions
- Passwords hashed with scrypt (OWASP recommended)
- Bearer token extraction from Authorization header

## References
- [Passport.js JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices/)

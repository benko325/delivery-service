# ADR-012: EUR as Default Currency

## Status
**Accepted** - 2025-01-30

## Context

The delivery service operates in multiple countries and handles monetary values for:
- Menu item prices
- Cart totals
- Order amounts
- Delivery fees

We needed to decide on:
1. A default currency for the system
2. Whether to support multiple currencies
3. How currency is stored and transmitted

### Business Context
- Primary market: Czech Republic and EU countries
- Target expansion: European market
- Simplicity preferred for MVP

## Decision

We will use **EUR (Euro)** as the default currency throughout the system.

### Implementation

**Database Defaults:**
```typescript
// In migrations
.addColumn('currency', 'varchar(3)', col => col.notNull().defaultTo('EUR'))
```

**Aggregate Defaults:**
```typescript
export class CartAggregate extends AggregateRoot {
    private _currency: string = 'EUR';
}

export class OrderAggregate extends AggregateRoot {
    private _currency: string = 'EUR';
}

export class MenuItemAggregate extends AggregateRoot {
    private _currency: string = 'EUR';
}
```

**DTO Validation:**
```typescript
const orderItemSchema = z.object({
    menuItemId: z.string().uuid(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    currency: z.string().length(3).default('EUR'),
});

export const createOrderSchema = z.object({
    // ...
    currency: z.string().length(3).default('EUR'),
});
```

**Seed Data:**
```typescript
// Restaurant seed
{
    price: 12.99,
    currency: 'EUR',
}
```

### Currency Flow
```
Restaurant creates menu item (EUR)
       ↓
Customer adds to cart (currency from menu item)
       ↓
Cart calculates total (same currency)
       ↓
Checkout creates order (currency preserved)
       ↓
Order stored with currency for historical record
```

### Currency in OrderItem
Each order item stores its currency:
```typescript
interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    currency: string;  // Preserved from menu item
}
```

## Consequences

### Positive
- **Consistency** - All monetary values in same currency
- **Simplicity** - No currency conversion logic needed
- **EU alignment** - EUR is standard for European market
- **Auditability** - Currency stored with each transaction

### Negative
- **Limited flexibility** - Non-EUR restaurants would need conversion
- **No multi-currency** - Cannot show prices in local currency

### Future Considerations

If multi-currency support is needed:
1. Add `display_currency` for UI presentation
2. Store base currency (EUR) for calculations
3. Implement currency conversion service
4. Update price at order time (snapshot pricing)

### Affected Files

| Module | Files |
|--------|-------|
| Carts | `cart.dto.ts`, `cart.aggregate.ts`, migration |
| Orders | `order.dto.ts`, `order.aggregate.ts`, `cart-ordered.mapper.ts`, migration |
| Restaurants | `menu-item.dto.ts`, `menu-item.aggregate.ts`, seed migration |

## References
- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)
- [Handling Money in Software](https://martinfowler.com/eaaCatalog/money.html)

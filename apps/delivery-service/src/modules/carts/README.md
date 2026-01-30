# Carts Module

The Carts module manages shopping cart functionality for customers in the food delivery platform. It follows Domain-Driven Design (DDD) principles with CQRS pattern and event-driven architecture.

## Features

- **Add items to cart** - Add menu items from restaurants
- **Update item quantity** - Change quantity of items in cart
- **Remove items** - Remove specific items from cart
- **Clear cart** - Remove all items from cart
- **Checkout** - Convert cart to order via event-driven flow

## Business Rules

- A cart can only contain items from **one restaurant** at a time
- Adding an item from a different restaurant throws an error
- Cart is automatically cleared after successful checkout
- Empty carts cannot be checked out

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get current customer's cart | Customer |
| POST | `/cart/items` | Add item to cart | Customer |
| PATCH | `/cart/items` | Update item quantity | Customer |
| DELETE | `/cart/items` | Remove item from cart | Customer |
| DELETE | `/cart` | Clear entire cart | Customer |
| POST | `/cart/checkout` | Checkout cart and create order | Customer |

## Commands

| Command | Description |
|---------|-------------|
| `AddItemToCartCommand` | Adds a menu item to the customer's cart |
| `UpdateItemQuantityCommand` | Updates quantity of an item in cart |
| `RemoveItemFromCartCommand` | Removes an item from cart |
| `ClearCartCommand` | Clears all items from cart |
| `CheckoutCartCommand` | Initiates checkout process |

## Queries

| Query | Description |
|-------|-------------|
| `GetCartByCustomerIdQuery` | Retrieves cart for a specific customer |

## Events

### Published Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `CartItemAddedEvent` | Item added to cart | Contains cartId, customerId, menuItemId, quantity |
| `CartClearedEvent` | Cart cleared | Contains cartId, customerId |
| `CartOrderedEvent` | Cart checked out | Contains full cart data for order creation |

### CartOrderedEvent Flow

```
Customer calls POST /cart/checkout
         |
         v
+------------------+
| CheckoutCart     |
| CommandHandler   |
+------------------+
         |
         | 1. Validate cart exists and not empty
         | 2. Call CartAggregate.checkout()
         | 3. Delete cart from database
         | 4. Commit events
         v
+------------------+
| CartOrderedEvent |
| (published)      |
+------------------+
         |
         | via RabbitMQ
         v
+------------------+
| Orders Module    |
| ACL Handler      |
+------------------+
         |
         | Maps CartItem[] to OrderItem[]
         | Maps DeliveryAddress types
         v
+------------------+
| CreateOrder      |
| Command          |
+------------------+
         |
         v
   Order Created
```

## Folder Structure

```
carts/
├── api/
│   ├── controllers/
│   │   └── carts.controller.ts
│   └── dtos/
│       └── cart.dto.ts
├── application/
│   ├── commands/
│   │   ├── add-item-to-cart/
│   │   ├── remove-item-from-cart/
│   │   ├── update-item-quantity/
│   │   ├── clear-cart/
│   │   └── checkout-cart/
│   └── queries/
│       └── get-cart-by-customer-id/
├── core/
│   ├── aggregates/
│   │   └── cart.aggregate.ts
│   ├── events/
│   │   ├── cart-item-added.event.ts
│   │   ├── cart-cleared.event.ts
│   │   └── cart-ordered.event.ts
│   ├── repositories/
│   │   └── cart.repository.interface.ts
│   └── types/
│       ├── cart-database.types.ts
│       └── delivery-address.types.ts
├── infrastructure/
│   ├── config/
│   └── database/
│       └── repositories/
├── carts.module.ts
└── README.md
```

## Integration with Other Modules

### Orders Module (Outbound)

When a cart is checked out, the `CartOrderedEvent` is published via RabbitMQ. The Orders module subscribes to this event through its Anti-Corruption Layer (ACL) and creates an order.

**Data Mapping (ACL):**
```
CartItem                    OrderItem
├── menuItemId      ->      ├── menuItemId
├── name            ->      ├── name
├── price           ->      ├── price
├── quantity        ->      └── quantity
├── restaurantId    X       (not included)
└── currency        X       (not included)
```

## Example Usage

### Add Item to Cart
```json
POST /cart/items
{
  "menuItemId": "uuid",
  "restaurantId": "uuid",
  "name": "Margherita Pizza",
  "price": 12.99,
  "currency": "USD",
  "quantity": 2
}
```

### Checkout Cart
```json
POST /cart/checkout
{
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Prague",
    "postalCode": "11000",
    "country": "Czech Republic",
    "instructions": "Ring doorbell twice"
  },
  "deliveryFee": 3.50
}
```

Response:
```json
{
  "message": "Cart ordered successfully"
}
```

Note: The order is created asynchronously via events. Use `GET /orders/my-orders` to retrieve the created order.

# Restaurants Module

The Restaurants module manages restaurant entities, menu items, and order confirmation/rejection workflows in the food delivery platform. It follows Domain-Driven Design (DDD) principles with CQRS pattern and event-driven architecture.

## Features

- **Restaurant CRUD** - Create, read, update restaurants
- **Restaurant status** - Activate/deactivate restaurants
- **Menu management** - Create, update, delete menu items
- **Order management** - Confirm or reject incoming orders

## Business Rules

- Only active restaurants can confirm orders
- Deactivating a restaurant publishes an event for other modules
- Restaurant owners and admins can manage restaurants
- Orders can only be confirmed/rejected by the restaurant they belong to

## API Endpoints

### Restaurant Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/restaurants` | Get all active restaurants | Public |
| GET | `/restaurants/all` | Get all restaurants (including inactive) | Admin |
| GET | `/restaurants/:id` | Get restaurant by ID | Public |
| POST | `/restaurants` | Create new restaurant | Admin, Owner |
| PUT | `/restaurants/:id` | Update restaurant | Admin, Owner |
| POST | `/restaurants/:id/activate` | Activate restaurant | Admin, Owner |
| POST | `/restaurants/:id/deactivate` | Deactivate restaurant | Admin, Owner |

### Order Management Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/restaurants/:restaurantId/orders/:orderId/confirm` | Confirm an order | Admin, Owner |
| POST | `/restaurants/:restaurantId/orders/:orderId/reject` | Reject an order | Admin, Owner |

### Menu Item Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/restaurants/:restaurantId/menu-items` | Get restaurant menu | Public |
| POST | `/restaurants/:restaurantId/menu-items` | Create menu item | Admin, Owner |
| PUT | `/restaurants/:restaurantId/menu-items/:id` | Update menu item | Admin, Owner |
| DELETE | `/restaurants/:restaurantId/menu-items/:id` | Delete menu item | Admin, Owner |

## Commands

| Command | Description |
|---------|-------------|
| `CreateRestaurantCommand` | Creates a new restaurant |
| `UpdateRestaurantCommand` | Updates restaurant details |
| `ActivateRestaurantCommand` | Activates a restaurant |
| `DeactivateRestaurantCommand` | Deactivates a restaurant |
| `ConfirmOrderCommand` | Restaurant confirms an order |
| `RejectOrderCommand` | Restaurant rejects an order |
| `CreateMenuItemCommand` | Creates a new menu item |
| `UpdateMenuItemCommand` | Updates a menu item |
| `DeleteMenuItemCommand` | Deletes a menu item |

## Queries

| Query | Description |
|-------|-------------|
| `GetRestaurantByIdQuery` | Retrieves restaurant by ID |
| `GetAllRestaurantsQuery` | Retrieves all restaurants (with active filter) |
| `GetMenuItemsByRestaurantQuery` | Retrieves menu items for a restaurant |

## Events

### Published Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `RestaurantCreatedEvent` | Restaurant created | Contains restaurant ID, owner, name, address |
| `RestaurantDeactivatedEvent` | Restaurant deactivated | Notifies other modules of status change |
| `OrderConfirmedByRestaurantEvent` | Order confirmed | Triggers order status update in Orders module |
| `OrderRejectedByRestaurantEvent` | Order rejected | Triggers order cancellation in Orders module |

### Order Confirmation Flow

```
Restaurant owner calls POST /restaurants/:id/orders/:orderId/confirm
         |
         v
+------------------------+
| ConfirmOrderCommand    |
| Handler                |
+------------------------+
         |
         | 1. Validate restaurant exists
         | 2. Validate restaurant is active
         | 3. Create and publish event
         v
+------------------------+
| OrderConfirmedBy       |
| RestaurantEvent        |
+------------------------+
         |
         | via RabbitMQ
         v
+------------------------+
| Orders Module ACL      |
| (OrderConfirmedBy      |
|  RestaurantMapper)     |
+------------------------+
         |
         | Executes UpdateOrderStatusCommand
         v
+------------------------+
| Order status changed   |
| to 'confirmed'         |
+------------------------+
```

### Order Rejection Flow

```
Restaurant owner calls POST /restaurants/:id/orders/:orderId/reject
         |
         v
+------------------------+
| RejectOrderCommand     |
| Handler                |
+------------------------+
         |
         | 1. Validate restaurant exists
         | 2. Create and publish event with reason
         v
+------------------------+
| OrderRejectedBy        |
| RestaurantEvent        |
+------------------------+
         |
         | via RabbitMQ
         v
+------------------------+
| Orders Module ACL      |
| (OrderRejectedBy       |
|  RestaurantMapper)     |
+------------------------+
         |
         | Executes CancelOrderCommand
         | with reason: "Restaurant rejected: {reason}"
         v
+------------------------+
| Order cancelled        |
+------------------------+
```

### Restaurant Deactivation Flow

```
Admin calls POST /restaurants/:id/deactivate
         |
         v
+------------------------+
| DeactivateRestaurant   |
| CommandHandler         |
+------------------------+
         |
         | 1. Load restaurant aggregate
         | 2. Call deactivate() method
         | 3. Save to database
         | 4. Commit events
         v
+------------------------+
| RestaurantDeactivated  |
| Event                  |
+------------------------+
         |
         | via RabbitMQ
         v
   Available for other modules
   (e.g., notify customers, cancel pending orders)
```

## Folder Structure

```
restaurants/
├── api/
│   ├── controllers/
│   │   ├── restaurants.controller.ts
│   │   └── menu-items.controller.ts
│   └── dtos/
│       ├── restaurant.dto.ts
│       └── menu-item.dto.ts
├── application/
│   ├── commands/
│   │   ├── create-restaurant/
│   │   ├── update-restaurant/
│   │   ├── activate-restaurant/
│   │   ├── deactivate-restaurant/
│   │   ├── confirm-order/
│   │   ├── reject-order/
│   │   ├── create-menu-item/
│   │   ├── update-menu-item/
│   │   └── delete-menu-item/
│   └── queries/
│       ├── get-restaurant-by-id/
│       ├── get-all-restaurants/
│       └── get-menu-items-by-restaurant/
├── core/
│   ├── aggregates/
│   │   └── restaurant.aggregate.ts
│   ├── entities/
│   │   └── menu-item.entity.ts
│   ├── events/
│   │   ├── restaurant-created.event.ts
│   │   ├── restaurant-deactivated.event.ts
│   │   ├── order-confirmed-by-restaurant.event.ts
│   │   └── order-rejected-by-restaurant.event.ts
│   ├── repositories/
│   │   ├── restaurant.repository.interface.ts
│   │   └── menu-item.repository.interface.ts
│   └── types/
│       └── restaurant-database.types.ts
├── infrastructure/
│   ├── config/
│   └── database/
│       ├── migrations/
│       └── repositories/
├── restaurants.module.ts
└── README.md
```

## Integration with Other Modules

### Orders Module (Outbound)

The Restaurants module publishes events that the Orders module consumes:

| Event | Orders Module Action |
|-------|---------------------|
| `OrderConfirmedByRestaurantEvent` | Updates order status to `confirmed` |
| `OrderRejectedByRestaurantEvent` | Cancels the order with rejection reason |

### Event Data Structures

**OrderConfirmedByRestaurantEvent:**
```typescript
{
  orderId: string;
  restaurantId: string;
  estimatedPreparationMinutes: number;
  confirmedAt: Date;
}
```

**OrderRejectedByRestaurantEvent:**
```typescript
{
  orderId: string;
  restaurantId: string;
  reason: string;
  rejectedAt: Date;
}
```

**RestaurantDeactivatedEvent:**
```typescript
{
  restaurantId: string;
  ownerId: string;
  name: string;
  deactivatedAt: Date;
}
```

## Example Usage

### Create Restaurant
```json
POST /restaurants
{
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "address": {
    "street": "123 Main St",
    "city": "Prague",
    "postalCode": "11000",
    "country": "Czech Republic"
  },
  "phone": "+420123456789",
  "email": "contact@pizzapalace.cz",
  "openingHours": {
    "monday": { "open": "10:00", "close": "22:00" },
    "tuesday": { "open": "10:00", "close": "22:00" }
  }
}
```

### Confirm Order
```json
POST /restaurants/uuid/orders/order-uuid/confirm
{
  "estimatedPreparationMinutes": 30
}
```

Response:
```json
{
  "success": true
}
```

### Reject Order
```json
POST /restaurants/uuid/orders/order-uuid/reject
{
  "reason": "Kitchen is too busy, cannot fulfill order"
}
```

Response:
```json
{
  "success": true
}
```

## Event Constructor Pattern

All events use the object constructor pattern for RabbitMQ compatibility:

```typescript
export class OrderConfirmedByRestaurantEvent implements IEvent {
  public readonly orderId: string;
  public readonly restaurantId: string;
  public readonly estimatedPreparationMinutes: number;
  public readonly confirmedAt: Date;

  constructor(data: {
    orderId: string;
    restaurantId: string;
    estimatedPreparationMinutes: number;
    confirmedAt: Date;
  }) {
    this.orderId = data.orderId;
    this.restaurantId = data.restaurantId;
    this.estimatedPreparationMinutes = data.estimatedPreparationMinutes;
    this.confirmedAt = data.confirmedAt instanceof Date
      ? data.confirmedAt
      : new Date(data.confirmedAt);
  }
}
```

This pattern ensures proper Date deserialization when events are received from RabbitMQ.

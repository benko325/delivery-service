# API Reference

Full API documentation is available via Swagger UI at: http://localhost:3000/api/docs

## User Roles

| Role | Permissions |
|------|-------------|
| `customer` | Browse restaurants, manage cart, place orders |
| `driver` | See available orders, accept and deliver |
| `restaurant_owner` | Manage restaurant and menu |
| `admin` | Full access to all operations |

---

## Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| GET | `/api/auth/me` | Get current user info | Required |
| PATCH | `/api/auth/users/:userId/role` | Update user role | Admin |

### Customers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/customers` | List all customers | Admin |
| GET | `/api/customers/me` | Get current customer profile | Customer |
| GET | `/api/customers/:id` | Get customer by ID | Admin |
| POST | `/api/customers` | Create customer | Admin |
| PUT | `/api/customers/me` | Update current profile | Customer |
| PUT | `/api/customers/:id` | Update customer | Admin |
| POST | `/api/customers/me/addresses` | Add delivery address | Customer |
| DELETE | `/api/customers/me/addresses/:addressId` | Remove address | Customer |
| GET | `/api/customers/me/favorites` | Get favorite restaurants | Customer |
| POST | `/api/customers/me/favorites/:restaurantId` | Add to favorites | Customer |
| DELETE | `/api/customers/me/favorites/:restaurantId` | Remove from favorites | Customer |

### Restaurants
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/restaurants` | List active restaurants | Public |
| GET | `/api/restaurants/all` | List all restaurants (incl. inactive) | Admin |
| GET | `/api/restaurants/:id` | Get restaurant details | Public |
| POST | `/api/restaurants` | Create restaurant | Admin/Owner |
| PUT | `/api/restaurants/:id` | Update restaurant | Admin/Owner |
| POST | `/api/restaurants/:id/activate` | Activate restaurant | Admin/Owner |
| POST | `/api/restaurants/:id/deactivate` | Deactivate restaurant | Admin/Owner |
| POST | `/api/restaurants/:restaurantId/orders/:orderId/confirm` | Confirm order | Owner |
| POST | `/api/restaurants/:restaurantId/orders/:orderId/reject` | Reject order | Owner |

### Menu Items
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/restaurants/:restaurantId/menu` | Get available menu items | Public |
| GET | `/api/restaurants/:restaurantId/menu/all` | Get all menu items | Admin/Owner |
| POST | `/api/restaurants/:restaurantId/menu` | Create menu item | Admin/Owner |
| PUT | `/api/restaurants/:restaurantId/menu/:id` | Update menu item | Admin/Owner |
| DELETE | `/api/restaurants/:restaurantId/menu/:id` | Delete menu item | Admin/Owner |

### Drivers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/drivers` | List all drivers | Admin |
| GET | `/api/drivers/available` | List available drivers | Admin/Owner |
| GET | `/api/drivers/me` | Get current driver profile | Driver |
| GET | `/api/drivers/:id` | Get driver by ID | Admin |
| POST | `/api/drivers` | Register as driver | Required |
| PUT | `/api/drivers/me` | Update current profile | Driver |
| PATCH | `/api/drivers/me/location` | Update location | Driver |
| PATCH | `/api/drivers/me/availability` | Set availability status | Driver |
| POST | `/api/drivers/deliveries/:orderId/accept` | Accept a delivery | Driver |
| POST | `/api/drivers/deliveries/:orderId/reject` | Reject a delivery | Driver |
| POST | `/api/drivers/deliveries/complete` | Complete current delivery | Driver |
| PATCH | `/api/drivers/me/deactivate` | Deactivate own account | Driver |
| PATCH | `/api/drivers/:id/deactivate` | Deactivate driver | Admin |

### Carts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get cart | Customer |
| POST | `/api/cart/items` | Add item | Customer |
| PATCH | `/api/cart/items` | Update quantity | Customer |
| DELETE | `/api/cart/items` | Remove item | Customer |
| DELETE | `/api/cart` | Clear cart | Customer |
| POST | `/api/cart/checkout` | Checkout cart (creates order) | Customer |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order directly | Customer |
| GET | `/api/orders/my-orders` | Get customer orders | Customer |
| GET | `/api/orders/my-deliveries` | Get driver deliveries | Driver |
| GET | `/api/orders/available` | Get available orders for pickup | Driver |
| GET | `/api/orders/restaurant/:restaurantId` | Get restaurant orders | Admin/Owner |
| GET | `/api/orders/:id` | Get order by ID | Required |
| POST | `/api/orders/:id/pay` | Pay for order | Customer |
| POST | `/api/orders/:id/accept` | Accept order for delivery | Driver |
| PATCH | `/api/orders/:id/status` | Update status | Admin/Owner/Driver |
| POST | `/api/orders/:id/cancel` | Cancel order | Customer/Admin/Owner |

# Authentication Middleware

This middleware protects routes that require authentication.

## Usage

Add the middleware to any page that should require authentication:

```vue
<script setup lang="ts">
// Protect this page with auth middleware
definePageMeta({
  middleware: 'auth'
});

// Your page code here...
</script>
```

## How it works

1. When a user tries to access a protected page, the middleware checks if they are authenticated
2. If not authenticated, they are redirected to `/login` with a `redirect` query parameter containing the original URL
3. After successful login, the user is redirected back to the original page they tried to access

## Protected Pages

The following pages are currently protected:
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/[id]` - Order details

## Public Pages

These pages remain accessible without authentication:
- `/` - Restaurant list
- `/login` - Login page
- `/register` - Registration page
- `/restaurants/[id]` - Restaurant details and menu

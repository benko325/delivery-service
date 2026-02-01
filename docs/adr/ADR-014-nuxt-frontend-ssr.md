# ADR-014: Nuxt 4 Frontend with Server-Side Rendering

## Status
**Accepted** - 2026-02-01

## Context

We need to build a frontend application for the food delivery service that handles multiple user types:
- Customers browsing restaurants and placing orders
- Restaurant owners managing menus and orders
- Delivery drivers managing deliveries

### Requirements
- SEO-friendly for restaurant listings
- Fast initial page load
- Real-time updates for order status
- Multi-role user interface
- Type-safe API integration
- Production deployment via Docker

## Decision

We will use **Nuxt 4 with Server-Side Rendering (SSR)** and the following stack:

### Core Framework
- **Nuxt 4** - Latest Vue 3 meta-framework with SSR and improved performance
- **Vue 3 Composition API** - Modern reactive component composition
- **TypeScript** - Strict type checking enabled

### State Management
- **Pinia** - Official Vue state management
- **TanStack Query (Vue Query)** - Server state management with caching

### API Integration
- **openapi-fetch** - Type-safe fetch client
- **openapi-typescript** - Generate TypeScript types from OpenAPI spec
- Auto-generated types ensure frontend/backend contract

### UI Framework
- **Bootstrap 5** - Responsive CSS framework
- **Bootstrap Icons** - Icon library
- No custom CSS framework to reduce complexity

### Architecture Patterns
```
frontend/
├── app/
│   ├── pages/           # File-based routing
│   ├── components/      # Reusable Vue components
│   ├── composables/     # API hooks (useRestaurants, useOrders, etc.)
│   ├── stores/          # Pinia stores (auth, cart)
│   ├── middleware/      # Route guards (auth, role-based)
│   └── layouts/         # Page layouts (default)
├── types/
│   └── api.d.ts        # Auto-generated OpenAPI types
└── utils/
    └── api-client.ts   # Configured API client
```

### Key Design Decisions

1. **Composable-First API Layer**
   - Each backend module has a corresponding composable
   - TanStack Query handles caching, refetching, optimistic updates
   - Example: `useRestaurants()`, `useOrders()`, `useMenuItems()`

2. **Role-Based Navigation**
   - Middleware guards routes based on user roles
   - Navigation items conditionally rendered
   - Multi-role support (user can be both customer and restaurant owner)

3. **Dynamic API Base URL**
   - Client-side: Uses `window.location.origin/api` (nginx proxy)
   - SSR: Uses internal Docker network URL
   - No CORS issues, same-origin requests

4. **Type Safety**
   - OpenAPI spec → TypeScript types
   - Full type inference in API calls
   - Compile-time validation of API contracts

## Consequences

### Positive
- **SEO-Friendly** - Server-rendered restaurant listings crawlable by search engines
- **Fast Initial Load** - Server renders HTML before JavaScript executes
- **Type Safety** - OpenAPI → TypeScript prevents API contract mismatches
- **Developer Experience** - Auto-imports, file-based routing, hot module replacement
- **Automatic Caching** - TanStack Query handles cache invalidation
- **Production Ready** - SSR output is standalone, Docker-friendly
- **Future-Proof** - Can add edge rendering, ISR (Incremental Static Regeneration)

### Negative
- **Increased Complexity** - SSR adds server-side execution context
- **Build Time** - TypeScript + Vue compilation slower than plain JavaScript
- **Bundle Size** - Bootstrap + Icons + Vue adds ~150KB gzipped
- **SSR Gotchas** - Must handle client-only code (localStorage, window)
- **Learning Curve** - Team needs to understand SSR lifecycle

### Mitigations
- Use `import.meta.client` guards for client-only code
- Document SSR patterns in code comments
- Keep composables simple and focused
- Use Nuxt DevTools for debugging
- Leverage `.output` standalone builds for Docker

## Technical Details

### API Client Pattern
```typescript
// Auto-generated types from OpenAPI spec
import type { components } from "../types/api";

// Type-safe API calls
const { data, error } = await apiClient.GET("/api/restaurants/{id}", {
  params: { path: { id: restaurantId } }
});
```

### Composable Pattern
```typescript
export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/restaurants");
      if (error) throw error;
      return data;
    }
  });
}
```

### Middleware Pattern
```typescript
// restaurant-owner.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.hasAnyRole(["restaurant_owner", "admin"])) {
    return navigateTo("/");
  }
});
```

## Deployment

### Docker Build
- Multi-stage build (builder + production)
- Standalone `.output` directory (no node_modules needed)
- Nuxt Nitro server handles SSR
- Final image ~50MB (alpine + .output)

### Nginx Reverse Proxy
- `ds.localhost/` → Frontend (port 3000)
- `ds.localhost/api` → Backend (port 3000)
- Same origin, no CORS configuration needed

## Future Considerations

### Potential Enhancements
- **Edge Rendering** - Deploy to edge locations (Cloudflare, Vercel)
- **ISR** - Cache restaurant listings, revalidate periodically
- **PWA** - Offline support for order tracking
- **WebSockets** - Real-time order status updates
- **Image Optimization** - Nuxt Image for menu item photos
- **Internationalization** - Multi-language support

### Migration Path
If we need to split frontend:
- Customer app → Static export (SSG)
- Restaurant/Driver apps → Keep SSR
- Shared component library → Separate package

## References
- [Nuxt 4 Documentation](https://nuxt.com)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/vue/guides/query-keys)
- [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

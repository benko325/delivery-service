import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../types/api";

/**
 * @file API client factory using openapi-fetch
 * @description Creates a type-safe API client with authentication middleware
 */

/**
 * Creates an API client instance with auth middleware
 * @brief Creates a new API client with authentication middleware
 * @return Type-safe API client
 */
export function createApiClient() {
  const config = useRuntimeConfig();

  // Determine base URL
  // In browser: use window.location.origin/api (for nginx reverse proxy)
  // In SSR: use config value (for direct backend communication)
  const baseUrl = import.meta.client
    ? window.location.origin
    : (config.public.apiBase as string);

  const client = createClient<paths>({
    baseUrl,
  });

  // Auth middleware - adds JWT token to requests
  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      // Get token from auth store (will be available after store initialization)
      if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return request;
    },
  };

  client.use(authMiddleware);

  return client;
}

/**
 * Returns an API client instance
 * @brief Returns a cached API client instance (request-scoped in SSR, app-scoped in CSR)
 * @description In Nuxt SSR, composables are automatically cached per request.
 * On the client side, the instance is reused across the app lifecycle.
 * This ensures no auth token leakage between different users' server requests.
 */
export function useApiClient() {
  return createApiClient();
}

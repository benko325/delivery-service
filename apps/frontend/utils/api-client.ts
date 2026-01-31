import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../types/api";

/**
 * @file API client factory using openapi-fetch
 * @description Creates a type-safe API client with authentication middleware
 */

/**
 * Creates an API client instance with auth middleware
 * @returns Type-safe API client
 */
export function createApiClient() {
  const config = useRuntimeConfig();

  const client = createClient<paths>({
    baseUrl: config.public.apiBase as string,
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

// Singleton instance
let apiClientInstance: ReturnType<typeof createClient<paths>> | null = null;

/**
 * Returns a singleton API client instance
 * @brief Ensures only one API client exists across the app
 */
export function useApiClient() {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient();
  }
  return apiClientInstance;
}

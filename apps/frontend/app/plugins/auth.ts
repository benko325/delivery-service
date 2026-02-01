import { useApiClient } from "~/../utils/api-client";

/**
 * @file Auth initialization plugin
 * @description Loads user authentication state on app startup
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  if (import.meta.client) {
    const token = localStorage.getItem("auth_token");

    if (token) {
      authStore.token = token;

      // Fetch user info from /me endpoint
      try {
        const apiClient = useApiClient();
        const { data: userInfo, error } = await apiClient.GET("/api/auth/me");

        if (!error && userInfo) {
          const roles = Array.isArray(userInfo.roles)
            ? userInfo.roles
            : [userInfo.roles];
          authStore.user = {
            id: userInfo.userId,
            email: userInfo.email,
            roles: roles as (
              | "customer"
              | "driver"
              | "admin"
              | "restaurant_owner"
            )[],
          };

          // Persist user to localStorage
          localStorage.setItem("auth_user", JSON.stringify(authStore.user));
        } else {
          // Token is invalid, clear it
          authStore.logout();
        }
      } catch (_error) {
        // Failed to fetch user info, clear auth
        authStore.logout();
      }
    }
  }
});

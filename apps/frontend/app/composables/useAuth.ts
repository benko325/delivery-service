import { useMutation, useQuery } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";
import { useAuthStore } from "~/stores/auth";

/**
 * @file Authentication composables
 * @description API hooks for authentication operations
 */

/**
 * @brief Fetch current user info from /me endpoint
 * @return User info query
 */
export function useMe() {
  const apiClient = useApiClient();
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/auth/me");
      if (error) throw error;
      return data;
    },
    enabled: computed(() => !!authStore.token),
  });
}

/**
 * @brief Login mutation
 * @return Mutation for logging in
 */
export function useLogin() {
  const apiClient = useApiClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data, error } = await apiClient.POST("/api/auth/login", {
        body: credentials,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data?.accessToken) {
        // Set token first
        authStore.token = data.accessToken;

        // Persist token to localStorage
        if (import.meta.client) {
          localStorage.setItem("auth_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
          }
        }

        // Fetch user info from /me endpoint
        const { data: userInfo, error: userError } =
          await apiClient.GET("/api/auth/me");
        if (!userError && userInfo) {
          const roles = Array.isArray(userInfo.roles)
            ? userInfo.roles
            : [userInfo.roles];
          authStore.setAuth(data.accessToken, {
            id: userInfo.userId,
            email: userInfo.email,
            roles: roles as (
              | "customer"
              | "driver"
              | "admin"
              | "restaurant_owner"
            )[],
          });
        }
        // Note: Redirect is handled in the page component to support redirect query param
      }
    },
  });
}

/**
 * @brief Register mutation
 * @return Mutation for registering a new user
 */
export function useRegister() {
  const apiClient = useApiClient();
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name: string;
      phone: string;
    }) => {
      const { data, error } = await apiClient.POST("/api/auth/register", {
        body: userData,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data?.accessToken) {
        // Set token first
        authStore.token = data.accessToken;

        // Persist token to localStorage
        if (import.meta.client) {
          localStorage.setItem("auth_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
          }
        }

        // Fetch user info from /me endpoint
        const { data: userInfo, error: userError } =
          await apiClient.GET("/api/auth/me");
        if (!userError && userInfo) {
          const roles = Array.isArray(userInfo.roles)
            ? userInfo.roles
            : [userInfo.roles];
          authStore.setAuth(data.accessToken, {
            id: userInfo.userId,
            email: userInfo.email,
            roles: roles as (
              | "customer"
              | "driver"
              | "admin"
              | "restaurant_owner"
            )[],
          });
        }

        router.push("/");
      }
    },
  });
}

/**
 * @brief Logout function
 * @return Logout handler
 */
export function useLogout() {
  const authStore = useAuthStore();
  const router = useRouter();

  return () => {
    authStore.logout();
    router.push("/login");
  };
}

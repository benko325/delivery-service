import { useMutation } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";
import { useAuthStore } from "~/stores/auth";

/**
 * @file Authentication composables
 * @description API hooks for authentication operations
 */

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
    onSuccess: (data) => {
      if (data?.accessToken && data?.user) {
        authStore.setAuth(data.accessToken, {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
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
    onSuccess: (data) => {
      if (data?.accessToken && data?.user) {
        authStore.setAuth(data.accessToken, {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
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
  const cartStore = useCartStore();
  const router = useRouter();

  return () => {
    authStore.logout();
    cartStore.clear();
    router.push("/login");
  };
}

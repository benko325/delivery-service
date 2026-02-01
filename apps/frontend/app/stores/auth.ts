import { defineStore } from "pinia";

/**
 * @file Authentication store
 * @description Manages user authentication state and JWT tokens
 */

type UserRole = "customer" | "restaurant_owner" | "driver" | "admin";

interface User {
  id: string;
  email: string;
  roles: UserRole[];
  name?: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
  }),

  getters: {
    /**
     * @brief Check if user is authenticated
     * @return True if user has a valid token
     */
    isAuthenticated: (state) => !!state.token,

    /**
     * @brief Get user roles
     * @return Array of user roles or empty array
     */
    userRoles: (state) => state.user?.roles || [],

    /**
     * @brief Check if user has a specific role
     * @param role Role to check
     * @return True if user has the role
     */
    hasRole: (state) => (role: UserRole) => {
      return state.user?.roles.includes(role) || false;
    },

    /**
     * @brief Check if user has any of the specified roles
     * @param roles Roles to check
     * @return True if user has at least one of the roles
     */
    hasAnyRole: (state) => (roles: UserRole[]) => {
      return (
        state.user?.roles.some((userRole) => roles.includes(userRole)) || false
      );
    },
  },

  actions: {
    /**
     * @brief Set authentication data
     * @param token JWT token
     * @param user User object
     */
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;

      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
      }
    },

    /**
     * @brief Load authentication data from localStorage
     */
    loadAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        const userJson = localStorage.getItem("auth_user");

        if (token && userJson) {
          this.token = token;
          this.user = JSON.parse(userJson);
        }
      }
    },

    /**
     * @brief Clear authentication and logout
     */
    logout() {
      this.token = null;
      this.user = null;

      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    },
  },
});

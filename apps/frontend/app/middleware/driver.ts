/**
 * @file Driver middleware
 * @description Protects driver routes - requires driver role
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.user) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  // Check if user has driver or admin role
  if (!authStore.hasAnyRole(["driver", "admin"])) {
    // Redirect to home with error message
    return navigateTo({
      path: "/",
      query: { error: "driver_required" },
    });
  }
});

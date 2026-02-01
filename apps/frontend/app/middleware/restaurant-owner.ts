/**
 * @file Restaurant owner middleware
 * @description Protects restaurant management routes - requires restaurant_owner role
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

  // Check if user has restaurant_owner or admin role
  if (!authStore.hasAnyRole(["restaurant_owner", "admin"])) {
    // Redirect to home with error message
    return navigateTo({
      path: "/",
      query: { error: "restaurant_owner_required" },
    });
  }
});

/**
 * @file Authentication middleware
 * @description Checks if user is authenticated, redirects to login if not
 */

export default defineNuxtRouteMiddleware((to) => {
  // Access the auth store
  const authStore = useAuthStore();

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login page with a return URL
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});

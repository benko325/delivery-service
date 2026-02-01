/**
 * @file Global authentication middleware
 * @description Checks if user is authenticated, redirects to login if not
 * Runs on every route change automatically
 */

export default defineNuxtRouteMiddleware((to) => {
  // Define public routes that don't require authentication
  const publicRoutes = new Set(["/login", "/register"]);

  // Check if the current route is public (exact path match)
  const isPublicRoute = publicRoutes.has(to.path);

  if (isPublicRoute) {
    return; // Allow access to public routes
  }

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

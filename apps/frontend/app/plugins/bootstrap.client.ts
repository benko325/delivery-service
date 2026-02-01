/**
 * @file Bootstrap JavaScript plugin
 * @description Loads Bootstrap JS for dropdowns, modals, etc.
 */

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Dynamically import Bootstrap JS
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }
});

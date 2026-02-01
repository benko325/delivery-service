import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

/**
 * @file TanStack Query plugin for Nuxt
 * @description Configures Vue Query for server state management
 */

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});

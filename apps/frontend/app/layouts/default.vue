<template>
  <div>
    <!-- Bootstrap Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand">
          <i class="bi bi-bicycle me-2"></i>
          Delivery Service
        </NuxtLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link">
                <i class="bi bi-house-door me-1"></i>
                Restaurants
              </NuxtLink>
            </li>
            <li v-if="authStore.isAuthenticated" class="nav-item">
              <NuxtLink to="/orders" class="nav-link">
                <i class="bi bi-receipt me-1"></i>
                My Orders
              </NuxtLink>
            </li>
          </ul>

          <ul class="navbar-nav">
            <!-- Cart -->
            <li class="nav-item">
              <NuxtLink to="/cart" class="nav-link position-relative">
                <i class="bi bi-cart3 me-1"></i>
                Cart
                <span
                  v-if="cartStore.itemCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  {{ cartStore.itemCount }}
                </span>
              </NuxtLink>
            </li>

            <!-- Auth -->
            <li v-if="!authStore.isAuthenticated" class="nav-item">
              <NuxtLink to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Login
              </NuxtLink>
            </li>
            <li v-else class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle me-1"></i>
                {{ authStore.user?.email }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button class="dropdown-item" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container my-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRoute();

// Load auth and cart on mount
onMounted(() => {
  authStore.loadAuth();
});

/**
 * @brief Handle user logout
 */
const handleLogout = () => {
  authStore.logout();
  cartStore.clear();
  router.push("/");
};
</script>

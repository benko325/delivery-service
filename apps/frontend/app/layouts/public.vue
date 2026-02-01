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
          </ul>

          <ul class="navbar-nav">
            <!-- Login/Register -->
            <li class="nav-item">
              <NuxtLink to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Login
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/register" class="nav-link">
                <i class="bi bi-person-plus me-1"></i>
                Register
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container my-4">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-light mt-5 py-4">
      <div class="container text-center text-muted">
        <p class="mb-0">
          <i class="bi bi-info-circle me-1"></i>
          Please login or register to place orders and access your cart
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Public layout
 * @description Layout for logged out users (login, register pages)
 */
</script>

<script setup lang="ts">
/**
 * @file Restaurant list page
 * @description Displays available restaurants using the useRestaurants composable
 */

const { data: restaurants, isLoading, error } = useRestaurants();
</script>

<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-shop me-2"></i>
      Restaurants
    </h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load restaurants
    </div>

    <!-- Restaurant Grid -->
    <div v-else-if="restaurants && restaurants?.length > 0" class="row g-4">
      <div
        v-for="restaurant in restaurants"
        :key="restaurant.id"
        class="col-md-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ restaurant.name }}</h5>
            <p class="card-text text-muted small mb-2">
              <i class="bi bi-geo-alt me-1"></i>
              {{ restaurant.address.street }}, {{ restaurant.address.city }}
            </p>
            <p v-if="restaurant.description" class="card-text">
              {{ restaurant.description }}
            </p>
            <p class="card-text small text-muted">
              <i class="bi bi-telephone me-1"></i>
              {{ restaurant.phone }}
            </p>
          </div>
          <div class="card-footer bg-transparent">
            <NuxtLink
              :to="{ name: 'restaurants-id', params: { id: restaurant.id } }"
              class="btn btn-primary w-100"
            >
              <i class="bi bi-book me-2"></i>
              View Menu
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center text-muted my-5">
      <i class="bi bi-shop" style="font-size: 3rem"></i>
      <p class="mt-3">No restaurants available</p>
    </div>
  </div>
</template>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Login
          </h2>

          <form @submit.prevent="handleSubmit">
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-control"
                required
                placeholder="Enter your email"
              />
            </div>

            <!-- Password -->
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-control"
                required
                placeholder="Enter your password"
              />
            </div>

            <!-- Error Message -->
            <div v-if="loginMutation.isError.value" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Login failed. Please check your credentials.
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="loginMutation.isPending.value"
            >
              <span v-if="loginMutation.isPending.value">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </span>
              <span v-else>Login</span>
            </button>
          </form>

          <hr class="my-4" />

          <p class="text-center text-muted mb-0">
            Don't have an account?
            <NuxtLink to="/register" class="text-decoration-none">
              Register here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogin } from '~/composables/useAuth';

const route = useRoute();
const email = ref('');
const password = ref('');
const loginMutation = useLogin();

/**
 * @brief Handle form submission
 */
const handleSubmit = () => {
  loginMutation.mutate(
    {
      email: email.value,
      password: password.value,
    },
    {
      onSuccess: () => {
        // Redirect to the original page or home
        const redirect = route.query.redirect as string;
        navigateTo(redirect || '/');
      }
    }
  );
};
</script>

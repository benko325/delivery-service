<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">
            <i class="bi bi-person-plus me-2"></i>
            Register
          </h2>

          <form @submit.prevent="handleSubmit">
            <!-- Name -->
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                class="form-control"
                required
                minlength="2"
                placeholder="Enter your name"
              />
            </div>

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
                minlength="8"
                placeholder="Enter your password (min 8 characters)"
              />
            </div>

            <!-- Phone Number -->
            <div class="mb-3">
              <label for="phone" class="form-label">Phone Number</label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                class="form-control"
                required
                minlength="9"
                placeholder="Enter your phone number"
              />
            </div>

            <!-- Error Message -->
            <div
              v-if="registerMutation.isError.value"
              class="alert alert-danger"
            >
              <i class="bi bi-exclamation-triangle me-2"></i>
              Registration failed. Email may already be in use.
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="registerMutation.isPending.value"
            >
              <span v-if="registerMutation.isPending.value">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Registering...
              </span>
              <span v-else>Register</span>
            </button>
          </form>

          <hr class="my-4" />

          <p class="text-center text-muted mb-0">
            Already have an account?
            <NuxtLink to="/login" class="text-decoration-none">
              Login here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegister } from "~/composables/useAuth";

const name = ref("");
const email = ref("");
const password = ref("");
const phone = ref("");
const registerMutation = useRegister();

/**
 * @brief Handle form submission
 */
const handleSubmit = () => {
  registerMutation.mutate({
    name: name.value,
    email: email.value,
    password: password.value,
    phone: phone.value,
  });
};
</script>

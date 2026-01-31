import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test user credentials - match seeded users from migration
// Override with env vars if needed
const TEST_USERS = {
  customer: {
    email: __ENV.CUSTOMER_EMAIL || 'customer@delivery.local',
    password: __ENV.CUSTOMER_PASSWORD || 'Customer123!',
  },
  admin: {
    email: __ENV.ADMIN_EMAIL || 'admin@delivery.local',
    password: __ENV.ADMIN_PASSWORD || 'Admin123!',
  },
  driver: {
    email: __ENV.DRIVER_EMAIL || 'driver@delivery.local',
    password: __ENV.DRIVER_PASSWORD || 'Driver123!',
  },
  restaurant_owner: {
    email: __ENV.RESTAURANT_OWNER_EMAIL || 'owner@delivery.local',
    password: __ENV.RESTAURANT_OWNER_PASSWORD || 'Owner123!',
  },
};

// Token cache - stores tokens per role
const tokenCache = {};

/**
 * Login and get JWT token for a specific role
 * @param {string} role - 'customer' | 'admin' | 'driver' | 'restaurant_owner'
 * @returns {string} JWT access token
 */
export function getAuthToken(role = 'customer') {
  // Return cached token if available
  if (tokenCache[role]) {
    return tokenCache[role];
  }

  const user = TEST_USERS[role];
  if (!user) {
    throw new Error(`Unknown role: ${role}. Available: customer, admin, driver, restaurant_owner`);
  }

  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const response = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status !== 200) {
    console.error(`Login failed for ${role}: ${response.status} - ${response.body}`);
    throw new Error(`Failed to login as ${role}`);
  }

  const body = JSON.parse(response.body);
  tokenCache[role] = body.accessToken;

  return body.accessToken;
}

/**
 * Get headers with auth token for a specific role
 * @param {string} role - 'customer' | 'admin' | 'driver' | 'restaurant_owner'
 * @returns {object} Headers object with Authorization
 */
export function getAuthHeaders(role = 'customer') {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken(role)}`,
  };
}

/**
 * Get headers without auth (for unauthorized tests)
 * @returns {object} Headers object without Authorization
 */
export function getUnauthHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Clear token cache (useful for testing token refresh)
 */
export function clearTokenCache() {
  Object.keys(tokenCache).forEach(key => delete tokenCache[key]);
}

export const BASE_API_URL = `${BASE_URL}/api`;

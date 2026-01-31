import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class RestaurantsTests {

  GetAllRestaurants() {
    // Public endpoint - no auth required
    const response = http.get(`${BASE_API_URL}/restaurants`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'RestaurantsTests.GetAllRestaurants: has status 200': (r) => r.status === 200,
      'RestaurantsTests.GetAllRestaurants: response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
  }

  GetAllRestaurantsAdmin() {
    const response = http.get(`${BASE_API_URL}/restaurants/all`, {
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'RestaurantsTests.GetAllRestaurantsAdmin: has status 200': (r) => r.status === 200,
      'RestaurantsTests.GetAllRestaurantsAdmin: response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
  }
}

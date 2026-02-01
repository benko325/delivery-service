import { check } from 'k6';
import http from 'k6/http';
import { getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class RestaurantsUnauthorizedTests {

  CreateRestaurantUnauthorized() {
    const payload = JSON.stringify({
      name: 'Test Restaurant',
      description: 'A wonderful test restaurant with great food',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      },
      phone: '123456789',
      email: 'restaurant@test.com',
      openingHours: {},
    });

    const response = http.post(`${BASE_API_URL}/restaurants`, payload, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'RestaurantsUnauthorizedTests.CreateRestaurantUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  GetAllIncludingInactiveUnauthorized() {
    const response = http.get(`${BASE_API_URL}/restaurants/all`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'RestaurantsUnauthorizedTests.GetAllIncludingInactiveUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}

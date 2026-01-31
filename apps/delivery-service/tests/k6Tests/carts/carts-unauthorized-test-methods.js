import { check } from 'k6';
import http from 'k6/http';
import { getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class CartsUnauthorizedTests {

  GetCartUnauthorized() {
    const response = http.get(`${BASE_API_URL}/cart`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'CartsUnauthorizedTests.GetCartUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  AddItemUnauthorized() {
    const payload = JSON.stringify({
      menuItemId: '550e8400-e29b-41d4-a716-446655440001',
      restaurantId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Test Item',
      price: 10.00,
      currency: 'EUR',
      quantity: 1,
    });

    const response = http.post(`${BASE_API_URL}/cart/items`, payload, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'CartsUnauthorizedTests.AddItemUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}

import { check } from 'k6';
import http from 'k6/http';
import { getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class OrdersUnauthorizedTests {

  GetMyOrdersUnauthorized() {
    const response = http.get(`${BASE_API_URL}/orders/my-orders`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'OrdersUnauthorizedTests.GetMyOrdersUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  CreateOrderUnauthorized() {
    const payload = JSON.stringify({
      restaurantId: '550e8400-e29b-41d4-a716-446655440001',
      items: [
        {
          menuItemId: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Test Item',
          price: 10.00,
          quantity: 1,
          currency: 'EUR',
        },
      ],
      deliveryAddress: {
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      },
      deliveryFee: 5.00,
    });

    const response = http.post(`${BASE_API_URL}/orders`, payload, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'OrdersUnauthorizedTests.CreateOrderUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}

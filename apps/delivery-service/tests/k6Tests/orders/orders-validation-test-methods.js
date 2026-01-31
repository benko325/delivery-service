import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class OrdersValidationTests {

  CreateOrderEmptyItems() {
    const payload = JSON.stringify({
      restaurantId: '550e8400-e29b-41d4-a716-446655440001',
      items: [],  // Empty items array - should fail
      deliveryAddress: {
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      },
      deliveryFee: 5.00,
    });

    const response = http.post(`${BASE_API_URL}/orders`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'OrdersValidationTests.CreateOrderEmptyItems: has status 400': (r) =>
        r.status === 400,
      'OrdersValidationTests.CreateOrderEmptyItems: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  CreateOrderInvalidRestaurantId() {
    const payload = JSON.stringify({
      restaurantId: 'not-a-valid-uuid',  // Invalid UUID
      items: [
        {
          menuItemId: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Test Item',
          price: 10.00,
          quantity: 1,
          currency: 'USD',
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
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'OrdersValidationTests.CreateOrderInvalidRestaurantId: has status 400': (r) =>
        r.status === 400,
      'OrdersValidationTests.CreateOrderInvalidRestaurantId: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  CancelOrderReasonTooShort() {
    // Use a fake order ID - we just want to test validation
    const orderId = '550e8400-e29b-41d4-a716-446655440099';
    const payload = JSON.stringify({
      reason: 'abc',  // Too short - min 5 characters
    });

    const response = http.post(`${BASE_API_URL}/orders/${orderId}/cancel`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'OrdersValidationTests.CancelOrderReasonTooShort: has status 400': (r) =>
        r.status === 400,
      'OrdersValidationTests.CancelOrderReasonTooShort: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }
}

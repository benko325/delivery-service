import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class CartsValidationTests {

  AddItemInvalidMenuItemId() {
    const payload = JSON.stringify({
      menuItemId: 'not-a-valid-uuid',
      restaurantId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Test Item',
      price: 10.00,
      currency: 'EUR',
      quantity: 1,
    });

    const response = http.post(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsValidationTests.AddItemInvalidMenuItemId: has status 400': (r) =>
        r.status === 400,
      'CartsValidationTests.AddItemInvalidMenuItemId: contains error message': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  AddItemMissingName() {
    const payload = JSON.stringify({
      menuItemId: '550e8400-e29b-41d4-a716-446655440001',
      restaurantId: '550e8400-e29b-41d4-a716-446655440002',
      name: '',
      price: 10.00,
      currency: 'EUR',
      quantity: 1,
    });

    const response = http.post(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsValidationTests.AddItemMissingName: has status 400': (r) =>
        r.status === 400,
      'CartsValidationTests.AddItemMissingName: contains validation error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  UpdateQuantityNegativeValue() {
    const payload = JSON.stringify({
      menuItemId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: -5,
    });

    const response = http.patch(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsValidationTests.UpdateQuantityNegativeValue: has status 400': (r) =>
        r.status === 400,
      'CartsValidationTests.UpdateQuantityNegativeValue: contains error': (r) => {
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

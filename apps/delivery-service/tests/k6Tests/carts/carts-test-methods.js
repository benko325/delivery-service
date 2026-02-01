import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

// Test data
const TEST_MENU_ITEM_ID = '550e8400-e29b-41d4-a716-446655440001';
const TEST_RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440002';
const TEST_ITEM_NAME = 'Test Pizza';
const TEST_ITEM_PRICE = 12.99;
const TEST_CURRENCY = 'EUR';
const TEST_QUANTITY = 2;

export class CartsTests {

  GetCart() {
    const response = http.get(`${BASE_API_URL}/cart`, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsTests.GetCart: has status 200': (r) => r.status === 200,
      'CartsTests.GetCart: response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  AddItemToCart() {
    const payload = JSON.stringify({
      menuItemId: TEST_MENU_ITEM_ID,
      restaurantId: TEST_RESTAURANT_ID,
      name: TEST_ITEM_NAME,
      price: TEST_ITEM_PRICE,
      currency: TEST_CURRENCY,
      quantity: TEST_QUANTITY,
    });

    const response = http.post(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsTests.AddItemToCart: has status 200': (r) => r.status === 200,
      'CartsTests.AddItemToCart: response is valid': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  UpdateItemQuantity() {
    const payload = JSON.stringify({
      menuItemId: TEST_MENU_ITEM_ID,
      quantity: 5,
    });

    const response = http.patch(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsTests.UpdateItemQuantity: has status 200': (r) => r.status === 200,
    });
  }

  RemoveItemFromCart() {
    const payload = JSON.stringify({
      menuItemId: TEST_MENU_ITEM_ID,
    });

    const response = http.del(`${BASE_API_URL}/cart/items`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsTests.RemoveItemFromCart: has status 200': (r) => r.status === 200,
    });
  }

  ClearCart() {
    const response = http.del(`${BASE_API_URL}/cart`, null, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CartsTests.ClearCart: has status 200': (r) => r.status === 200,
    });
  }
}

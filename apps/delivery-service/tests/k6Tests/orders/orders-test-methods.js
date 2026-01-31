import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class OrdersTests {

  GetMyOrders() {
    const response = http.get(`${BASE_API_URL}/orders/my-orders`, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'OrdersTests.GetMyOrders: has status 200': (r) => r.status === 200,
      'OrdersTests.GetMyOrders: response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
  }

  GetAvailableOrders() {
    const response = http.get(`${BASE_API_URL}/orders/available`, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'OrdersTests.GetAvailableOrders: has status 200': (r) => r.status === 200,
      'OrdersTests.GetAvailableOrders: response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
  }

  GetMyDeliveries() {
    const response = http.get(`${BASE_API_URL}/orders/my-deliveries`, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'OrdersTests.GetMyDeliveries: has status 200': (r) => r.status === 200,
      'OrdersTests.GetMyDeliveries: response is array': (r) => {
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

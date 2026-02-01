import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

// Test data
const TEST_NAME = 'Test Customer';
const TEST_PHONE = '123456789';
const TEST_ADDRESS = {
  street: '123 Test Street',
  city: 'Test City',
  postalCode: '12345',
  country: 'Test Country',
  label: 'Home',
};

export class CustomersTests {

  GetMyProfile() {
    const response = http.get(`${BASE_API_URL}/customers/me`, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersTests.GetMyProfile: has status 200': (r) => r.status === 200,
      'CustomersTests.GetMyProfile: response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  UpdateMyProfile() {
    const payload = JSON.stringify({
      name: TEST_NAME,
      phone: TEST_PHONE,
    });

    const response = http.put(`${BASE_API_URL}/customers/me`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersTests.UpdateMyProfile: has status 200': (r) => r.status === 200,
    });
  }

  AddAddress() {
    const payload = JSON.stringify({
      address: TEST_ADDRESS,
    });

    const response = http.post(`${BASE_API_URL}/customers/me/addresses`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersTests.AddAddress: has status 201': (r) => r.status === 201,
    });
  }

  GetFavorites() {
    const response = http.get(`${BASE_API_URL}/customers/me/favorites`, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersTests.GetFavorites: has status 200': (r) => r.status === 200,
      'CustomersTests.GetFavorites: response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  GetAllCustomersAsAdmin() {
    const response = http.get(`${BASE_API_URL}/customers`, {
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'CustomersTests.GetAllCustomersAsAdmin: has status 200': (r) => r.status === 200,
      'CustomersTests.GetAllCustomersAsAdmin: response is array': (r) => {
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

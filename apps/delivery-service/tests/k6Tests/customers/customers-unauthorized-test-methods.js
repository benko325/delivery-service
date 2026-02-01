import { check } from 'k6';
import http from 'k6/http';
import { getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class CustomersUnauthorizedTests {

  GetProfileUnauthorized() {
    const response = http.get(`${BASE_API_URL}/customers/me`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'CustomersUnauthorizedTests.GetProfileUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  UpdateProfileUnauthorized() {
    const payload = JSON.stringify({
      name: 'Test Name',
      phone: '123456789',
    });

    const response = http.put(`${BASE_API_URL}/customers/me`, payload, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'CustomersUnauthorizedTests.UpdateProfileUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}

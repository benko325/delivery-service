import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class CustomersValidationTests {

  UpdateProfileNameTooShort() {
    const payload = JSON.stringify({
      name: 'A',  // Too short - min 2 characters
      phone: '123456789',
    });

    const response = http.put(`${BASE_API_URL}/customers/me`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersValidationTests.UpdateProfileNameTooShort: has status 400': (r) =>
        r.status === 400,
      'CustomersValidationTests.UpdateProfileNameTooShort: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  UpdateProfilePhoneTooShort() {
    const payload = JSON.stringify({
      name: 'Valid Name',
      phone: '123',  // Too short - min 9 characters
    });

    const response = http.put(`${BASE_API_URL}/customers/me`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersValidationTests.UpdateProfilePhoneTooShort: has status 400': (r) =>
        r.status === 400,
      'CustomersValidationTests.UpdateProfilePhoneTooShort: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  AddAddressMissingStreet() {
    const payload = JSON.stringify({
      address: {
        street: '',  // Empty - required
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      },
    });

    const response = http.post(`${BASE_API_URL}/customers/me/addresses`, payload, {
      headers: getAuthHeaders('customer'),
    });

    check(response, {
      'CustomersValidationTests.AddAddressMissingStreet: has status 400': (r) =>
        r.status === 400,
      'CustomersValidationTests.AddAddressMissingStreet: contains error': (r) => {
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

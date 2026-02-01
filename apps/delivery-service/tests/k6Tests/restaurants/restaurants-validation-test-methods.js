import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class RestaurantsValidationTests {

  CreateRestaurantNameTooShort() {
    const payload = JSON.stringify({
      name: 'A',  // Too short - min 2 characters
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
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'RestaurantsValidationTests.CreateRestaurantNameTooShort: has status 400': (r) =>
        r.status === 400,
      'RestaurantsValidationTests.CreateRestaurantNameTooShort: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  CreateRestaurantInvalidEmail() {
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
      email: 'not-a-valid-email',  // Invalid email
      openingHours: {},
    });

    const response = http.post(`${BASE_API_URL}/restaurants`, payload, {
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'RestaurantsValidationTests.CreateRestaurantInvalidEmail: has status 400': (r) =>
        r.status === 400,
      'RestaurantsValidationTests.CreateRestaurantInvalidEmail: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  CreateRestaurantDescriptionTooShort() {
    const payload = JSON.stringify({
      name: 'Test Restaurant',
      description: 'Short',  // Too short - min 10 characters
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
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'RestaurantsValidationTests.CreateRestaurantDescriptionTooShort: has status 400': (r) =>
        r.status === 400,
      'RestaurantsValidationTests.CreateRestaurantDescriptionTooShort: contains error': (r) => {
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

import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class DriversValidationTests {

  UpdateProfileVehicleTypeTooShort() {
    const payload = JSON.stringify({
      vehicleType: 'A',  // Too short - min 2 characters
      licensePlate: 'TEST-123',
    });

    const response = http.put(`${BASE_API_URL}/drivers/me`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversValidationTests.UpdateProfileVehicleTypeTooShort: has status 400': (r) =>
        r.status === 400,
      'DriversValidationTests.UpdateProfileVehicleTypeTooShort: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  UpdateLocationInvalidLatitude() {
    const payload = JSON.stringify({
      latitude: 100,  // Invalid - max 90
      longitude: 21.0122,
    });

    const response = http.patch(`${BASE_API_URL}/drivers/me/location`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversValidationTests.UpdateLocationInvalidLatitude: has status 400': (r) =>
        r.status === 400,
      'DriversValidationTests.UpdateLocationInvalidLatitude: contains error': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message !== undefined || body.errors !== undefined;
        } catch {
          return false;
        }
      },
    });
  }

  SetAvailabilityInvalidStatus() {
    const payload = JSON.stringify({
      status: 'invalid_status',  // Invalid enum value
    });

    const response = http.patch(`${BASE_API_URL}/drivers/me/availability`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversValidationTests.SetAvailabilityInvalidStatus: has status 400': (r) =>
        r.status === 400,
      'DriversValidationTests.SetAvailabilityInvalidStatus: contains error': (r) => {
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

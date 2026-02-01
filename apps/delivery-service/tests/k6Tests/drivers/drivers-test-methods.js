import { check } from 'k6';
import http from 'k6/http';
import { getAuthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

// Test data
const TEST_VEHICLE_TYPE = 'Motorcycle';
const TEST_LICENSE_PLATE = 'TEST-456';
const TEST_LATITUDE = 52.2297;
const TEST_LONGITUDE = 21.0122;

export class DriversTests {

  GetMyProfile() {
    const response = http.get(`${BASE_API_URL}/drivers/me`, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversTests.GetMyProfile: has status 200': (r) => r.status === 200,
      'DriversTests.GetMyProfile: response is valid JSON': (r) => {
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
      vehicleType: TEST_VEHICLE_TYPE,
      licensePlate: TEST_LICENSE_PLATE,
    });

    const response = http.put(`${BASE_API_URL}/drivers/me`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversTests.UpdateMyProfile: has status 200': (r) => r.status === 200,
    });
  }

  UpdateLocation() {
    const payload = JSON.stringify({
      latitude: TEST_LATITUDE,
      longitude: TEST_LONGITUDE,
    });

    const response = http.patch(`${BASE_API_URL}/drivers/me/location`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversTests.UpdateLocation: has status 200': (r) => r.status === 200,
    });
  }

  SetAvailability() {
    const payload = JSON.stringify({
      status: 'available',
    });

    const response = http.patch(`${BASE_API_URL}/drivers/me/availability`, payload, {
      headers: getAuthHeaders('driver'),
    });

    check(response, {
      'DriversTests.SetAvailability: has status 200': (r) => r.status === 200,
    });
  }

  GetAllDriversAsAdmin() {
    const response = http.get(`${BASE_API_URL}/drivers`, {
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'DriversTests.GetAllDriversAsAdmin: has status 200': (r) => r.status === 200,
      'DriversTests.GetAllDriversAsAdmin: response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
  }

  GetAvailableDriversAsAdmin() {
    const response = http.get(`${BASE_API_URL}/drivers/available`, {
      headers: getAuthHeaders('admin'),
    });

    check(response, {
      'DriversTests.GetAvailableDriversAsAdmin: has status 200': (r) => r.status === 200,
      'DriversTests.GetAvailableDriversAsAdmin: response is array': (r) => {
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

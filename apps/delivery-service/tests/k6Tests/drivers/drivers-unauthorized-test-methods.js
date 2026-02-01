import { check } from 'k6';
import http from 'k6/http';
import { getUnauthHeaders, BASE_API_URL } from '../utils/auth-helper.js';

export class DriversUnauthorizedTests {

  GetProfileUnauthorized() {
    const response = http.get(`${BASE_API_URL}/drivers/me`, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'DriversUnauthorizedTests.GetProfileUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  UpdateLocationUnauthorized() {
    const payload = JSON.stringify({
      latitude: 52.2297,
      longitude: 21.0122,
    });

    const response = http.patch(`${BASE_API_URL}/drivers/me/location`, payload, {
      headers: getUnauthHeaders(),
    });

    check(response, {
      'DriversUnauthorizedTests.UpdateLocationUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}

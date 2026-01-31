import { group } from 'k6';
import { DriversTests } from './drivers-test-methods.js';
import { DriversUnauthorizedTests } from './drivers-unauthorized-test-methods.js';
import { DriversValidationTests } from './drivers-validation-test-methods.js';

const basicTests = new DriversTests();
const unauthorizedTests = new DriversUnauthorizedTests();
const validationTests = new DriversValidationTests();

export default () => {
  group('Drivers Module Tests', () => {
    // Happy path tests
    group('Functional Tests', () => {
      group('Get My Profile', () => {
        basicTests.GetMyProfile();
      });

      group('Update My Profile', () => {
        basicTests.UpdateMyProfile();
      });

      group('Update Location', () => {
        basicTests.UpdateLocation();
      });

      group('Set Availability', () => {
        basicTests.SetAvailability();
      });

      group('Get All Drivers (Admin)', () => {
        basicTests.GetAllDriversAsAdmin();
      });

      group('Get Available Drivers (Admin)', () => {
        basicTests.GetAvailableDriversAsAdmin();
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Get Profile Unauthorized', () => {
        unauthorizedTests.GetProfileUnauthorized();
      });

      group('Update Location Unauthorized', () => {
        unauthorizedTests.UpdateLocationUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Update Profile - Vehicle Type Too Short', () => {
        validationTests.UpdateProfileVehicleTypeTooShort();
      });

      group('Update Location - Invalid Latitude', () => {
        validationTests.UpdateLocationInvalidLatitude();
      });

      group('Set Availability - Invalid Status', () => {
        validationTests.SetAvailabilityInvalidStatus();
      });
    });
  });
};

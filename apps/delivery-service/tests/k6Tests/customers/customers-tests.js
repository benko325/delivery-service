import { group } from 'k6';
import { CustomersTests } from './customers-test-methods.js';
import { CustomersUnauthorizedTests } from './customers-unauthorized-test-methods.js';
import { CustomersValidationTests } from './customers-validation-test-methods.js';

const basicTests = new CustomersTests();
const unauthorizedTests = new CustomersUnauthorizedTests();
const validationTests = new CustomersValidationTests();

export default () => {
  group('Customers Module Tests', () => {
    // Happy path tests
    group('Functional Tests', () => {
      group('Get My Profile', () => {
        basicTests.GetMyProfile();
      });

      group('Update My Profile', () => {
        basicTests.UpdateMyProfile();
      });

      group('Add Address', () => {
        basicTests.AddAddress();
      });

      group('Get Favorites', () => {
        basicTests.GetFavorites();
      });

      group('Get All Customers (Admin)', () => {
        basicTests.GetAllCustomersAsAdmin();
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Get Profile Unauthorized', () => {
        unauthorizedTests.GetProfileUnauthorized();
      });

      group('Update Profile Unauthorized', () => {
        unauthorizedTests.UpdateProfileUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Update Profile - Name Too Short', () => {
        validationTests.UpdateProfileNameTooShort();
      });

      group('Update Profile - Phone Too Short', () => {
        validationTests.UpdateProfilePhoneTooShort();
      });

      group('Add Address - Missing Street', () => {
        validationTests.AddAddressMissingStreet();
      });
    });
  });
};

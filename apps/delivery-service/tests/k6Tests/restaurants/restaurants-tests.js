import { group } from 'k6';
import { RestaurantsTests } from './restaurants-test-methods.js';
import { RestaurantsUnauthorizedTests } from './restaurants-unauthorized-test-methods.js';
import { RestaurantsValidationTests } from './restaurants-validation-test-methods.js';

const basicTests = new RestaurantsTests();
const unauthorizedTests = new RestaurantsUnauthorizedTests();
const validationTests = new RestaurantsValidationTests();

export default () => {
  group('Restaurants Module Tests', () => {
    // Happy path tests
    group('Functional Tests', () => {
      group('Get All Restaurants (Public)', () => {
        basicTests.GetAllRestaurants();
      });

      group('Get All Restaurants Including Inactive (Admin)', () => {
        basicTests.GetAllRestaurantsAdmin();
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Create Restaurant Unauthorized', () => {
        unauthorizedTests.CreateRestaurantUnauthorized();
      });

      group('Get All Including Inactive Unauthorized', () => {
        unauthorizedTests.GetAllIncludingInactiveUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Create Restaurant - Name Too Short', () => {
        validationTests.CreateRestaurantNameTooShort();
      });

      group('Create Restaurant - Invalid Email', () => {
        validationTests.CreateRestaurantInvalidEmail();
      });

      group('Create Restaurant - Description Too Short', () => {
        validationTests.CreateRestaurantDescriptionTooShort();
      });
    });
  });
};

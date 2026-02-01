import { group } from 'k6';

// Import all module test orchestrators
import cartsTests from '../carts/carts-tests.js';
import customersTests from '../customers/customers-tests.js';
import driversTests from '../drivers/drivers-tests.js';
import ordersTests from '../orders/orders-tests.js';
import restaurantsTests from '../restaurants/restaurants-tests.js';

export const options = {
  vus: 1,
  iterations: 1,
};

export default () => {
  group('All API Tests', () => {
    group('Carts Module', () => {
      cartsTests();
    });

    group('Customers Module', () => {
      customersTests();
    });

    group('Drivers Module', () => {
      driversTests();
    });

    group('Orders Module', () => {
      ordersTests();
    });

    group('Restaurants Module', () => {
      restaurantsTests();
    });
  });
};

import { group } from 'k6';
import { OrdersTests } from './orders-test-methods.js';
import { OrdersUnauthorizedTests } from './orders-unauthorized-test-methods.js';
import { OrdersValidationTests } from './orders-validation-test-methods.js';

const basicTests = new OrdersTests();
const unauthorizedTests = new OrdersUnauthorizedTests();
const validationTests = new OrdersValidationTests();

export default () => {
  group('Orders Module Tests', () => {
    // Happy path tests
    group('Functional Tests', () => {
      group('Get My Orders (Customer)', () => {
        basicTests.GetMyOrders();
      });

      group('Get Available Orders (Driver)', () => {
        basicTests.GetAvailableOrders();
      });

      group('Get My Deliveries (Driver)', () => {
        basicTests.GetMyDeliveries();
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Get My Orders Unauthorized', () => {
        unauthorizedTests.GetMyOrdersUnauthorized();
      });

      group('Create Order Unauthorized', () => {
        unauthorizedTests.CreateOrderUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Create Order - Empty Items', () => {
        validationTests.CreateOrderEmptyItems();
      });

      group('Create Order - Invalid Restaurant ID', () => {
        validationTests.CreateOrderInvalidRestaurantId();
      });

      group('Cancel Order - Reason Too Short', () => {
        validationTests.CancelOrderReasonTooShort();
      });
    });
  });
};

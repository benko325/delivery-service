import { group } from 'k6';
import { CartsTests } from './carts-test-methods.js';
import { CartsUnauthorizedTests } from './carts-unauthorized-test-methods.js';
import { CartsValidationTests } from './carts-validation-test-methods.js';

const basicTests = new CartsTests();
const unauthorizedTests = new CartsUnauthorizedTests();
const validationTests = new CartsValidationTests();

export default () => {
  group('Carts Module Tests', () => {
    // Happy path tests
    group('Functional Tests', () => {
      group('Get Cart', () => {
        basicTests.GetCart();
      });

      group('Add Item to Cart', () => {
        basicTests.AddItemToCart();
      });

      group('Update Item Quantity', () => {
        basicTests.UpdateItemQuantity();
      });

      group('Remove Item from Cart', () => {
        basicTests.RemoveItemFromCart();
      });

      group('Clear Cart', () => {
        basicTests.ClearCart();
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Get Cart Unauthorized', () => {
        unauthorizedTests.GetCartUnauthorized();
      });

      group('Add Item Unauthorized', () => {
        unauthorizedTests.AddItemUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Add Item - Invalid MenuItemId', () => {
        validationTests.AddItemInvalidMenuItemId();
      });

      group('Add Item - Missing Name', () => {
        validationTests.AddItemMissingName();
      });

      group('Update Quantity - Negative Value', () => {
        validationTests.UpdateQuantityNegativeValue();
      });
    });
  });
};

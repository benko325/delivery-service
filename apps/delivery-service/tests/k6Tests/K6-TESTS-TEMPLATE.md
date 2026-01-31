# K6 Test Structure Template (Plain JavaScript Version)

This document provides a comprehensive template for creating k6 API tests in plain JavaScript (without TypeScript types).

---

## File Structure Overview

```
YourDomain/
├── api-domain-tests.js                      # Main orchestrator - connects all test files
├── api-domain-test-methods.js               # Happy path / functional tests
├── api-domain-unauthorized-test-methods.js  # 401 unauthorized tests
└── api-domain-validation-test.js            # 400 validation tests
```

---

## 1. MAIN ORCHESTRATOR FILE (`api-domain-tests.js`)

**Purpose**: Imports all test classes, instantiates them, and organizes test execution using k6 `group()` for hierarchical test reporting.

**Pattern**:

```javascript
import { group } from 'k6';
import { DomainTests } from './api-domain-test-methods.js';
import { DomainUnauthorizedTests } from './api-domain-unauthorized-test-methods.js';
import { DomainValidationTests } from './api-domain-validation-test.js';

const basicTests = new DomainTests();
const unauthorizedTests = new DomainUnauthorizedTests();
const validationsTests = new DomainValidationTests();

export default () => {
  group('Your.Domain Tests', () => {
    // Setup/Seed data first
    group('Seed Test Data', () => {
      basicTests.SeedTestData();
    });

    // Happy path tests
    group('Functional Tests', () => {
      group('Basic Tests', () => {
        group('Test Name 1', () => {
          basicTests.TestMethod1();
        });
        group('Test Name 2', () => {
          basicTests.TestMethod2();
        });
      });
    });

    // Authorization tests
    group('Authorization Tests', () => {
      group('Endpoint Unauthorized', () => {
        unauthorizedTests.EndpointUnauthorized();
      });
    });

    // Validation tests
    group('Validation Tests', () => {
      group('Field Required Validator', () => {
        validationsTests.FieldRequiredValidation();
      });
      group('Field MaxLength Validator', () => {
        validationsTests.FieldMaxLengthValidation();
      });
    });

    // Cleanup at the end
    group('Delete Test Data', () => {
      basicTests.DeleteTestData();
    });
  });
};
```

---

## 2. HAPPY PATH TESTS FILE (`api-domain-test-methods.js`)

**Purpose**: Contains functional tests that verify the API works correctly with valid inputs.

**Pattern**:

```javascript
import { check, sleep } from 'k6';
import { apiAuthenticatedClient } from '../../utils/api-provider-instances.js';

// Test data constants (no types - just regular variables)
const TEST_SEARCH_TERM = 'QA AUTOMATION';
const TEST_CONTRACT_NUMBER = 'QA-2025-001';
const PAGINATION_PAGE = 1;
const PAGINATION_PAGE_SIZE = 100;

// Response property names for structure checks
const RESPONSE_ITEMS_PROPERTY = 'items';
const RESPONSE_PAGE_PROPERTY = 'page';
const RESPONSE_TOTAL_COUNT_PROPERTY = 'totalCount';

export class DomainTests {

  // Setup method - seeds test data
  SeedTestData() {
    const response = apiAuthenticatedClient.POSTSeedData();
    check(response, {
      'DomainTests.SeedTestData: has status 200': (r) => r.status === 200,
    });
    // Wait for async processing if needed
    sleep(5);
  }

  // Cleanup method
  DeleteTestData() {
    const response = apiAuthenticatedClient.DELETETestData();
    check(response, {
      'DomainTests.DeleteTestData: has status 200': (r) => r.status === 200,
    });
  }

  // Basic GET test with query params
  SearchByTerm() {
    const params = {
      SearchTerm: TEST_SEARCH_TERM,
      Page: PAGINATION_PAGE,
      PageSize: PAGINATION_PAGE_SIZE,
    };

    const response = apiAuthenticatedClient.GETSearch(params);

    check(response, {
      'DomainTests.SearchByTerm: has status 200': (r) => r.status === 200,
      'DomainTests.SearchByTerm: response has data': (r) =>
        r.data !== null && r.data !== undefined,
      'DomainTests.SearchByTerm: items array exists': (r) =>
        r.data && r.data.items.length > 0,
      'DomainTests.SearchByTerm: contains expected item': (r) =>
        r.data.items.some((item) => item.name === TEST_SEARCH_TERM),
      'DomainTests.SearchByTerm: totalCount is positive': (r) =>
        r.data && r.data.totalCount > 0,
      'DomainTests.SearchByTerm: page matches requested': (r) =>
        r.data.page === PAGINATION_PAGE,
      'DomainTests.SearchByTerm: response structure is correct': (r) =>
        r.data &&
        Object.hasOwn(r.data, RESPONSE_ITEMS_PROPERTY) &&
        Object.hasOwn(r.data, RESPONSE_PAGE_PROPERTY) &&
        Object.hasOwn(r.data, RESPONSE_TOTAL_COUNT_PROPERTY),
    });
  }

  // Negative test - expects empty results
  SearchNonsenseTerm() {
    const params = {
      SearchTerm: 'XyZ9876NonExistentValue',
      Page: 1,
      PageSize: 100,
    };

    const response = apiAuthenticatedClient.GETSearch(params);

    check(response, {
      'DomainTests.SearchNonsenseTerm: has status 200': (r) => r.status === 200,
      'DomainTests.SearchNonsenseTerm: response has data': (r) =>
        r.data !== null && r.data !== undefined,
      'DomainTests.SearchNonsenseTerm: items array is empty': (r) =>
        r.data.items.length === 0,
    });
  }
}
```

---

## 3. UNAUTHORIZED TESTS FILE (`api-domain-unauthorized-test-methods.js`)

**Purpose**: Tests that endpoints return 401 when called without authentication.

**Pattern**:

```javascript
import { check } from 'k6';
import { apiUnauthenticated } from '../../utils/api-provider-instances.js';

export class DomainUnauthorizedTests {

  EndpointUnauthorized() {
    const response = apiUnauthenticated.GETEndpoint();

    check(response, {
      'DomainUnauthorizedTests.EndpointUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }

  AnotherEndpointUnauthorized() {
    const response = apiUnauthenticated.POSTAnotherEndpoint();

    check(response, {
      'DomainUnauthorizedTests.AnotherEndpointUnauthorized: has status 401': (r) =>
        r.status === 401,
    });
  }
}
```

---

## 4. VALIDATION TESTS FILE (`api-domain-validation-test.js`)

**Purpose**: Tests that FluentValidation rules return proper 400 errors with expected messages.

**Pattern**:

```javascript
import { check } from 'k6';
import { apiAuthenticatedClient } from '../../utils/api-provider-instances.js';

// Expected validation error messages (must match backend FluentValidation messages)
const FIELD_REQUIRED_ERROR = "'fieldName' must not be empty.";
const FIELD_MAX_LENGTH_ERROR =
  "The length of 'fieldName' must be 100 characters or fewer. You entered 101 characters.";
const PAGE_GREATER_THAN_ERROR = "'page' must be greater than or equal to '1'.";
const ENUM_INVALID_ERROR = "'enumField' has a range of values which does not include '999999'.";

// Test data
const OVER_HUNDRED_CHARS = 'a'.repeat(101);  // 101 character string
const INVALID_ENUM_VALUE = 999999;

export class DomainValidationTests {

  // Required field validation
  FieldRequiredValidation() {
    const params = {
      // Missing required field
      Page: 1,
      PageSize: 5,
    };

    const response = apiAuthenticatedClient.GETEndpoint(params);

    check(response, {
      'ValidationTests.FieldRequired: has 400 status': (r) => r.status === 400,
      'ValidationTests.FieldRequired: response contains error': (r) =>
        r.error != null,
      'ValidationTests.FieldRequired: has required validator message': (r) =>
        (r.error.errors?.fieldName?.includes(FIELD_REQUIRED_ERROR)) ?? false,
    });
  }

  // MaxLength validation
  FieldMaxLengthValidation() {
    const params = {
      FieldName: OVER_HUNDRED_CHARS,
      Page: 1,
      PageSize: 5,
    };

    const response = apiAuthenticatedClient.GETEndpoint(params);

    check(response, {
      'ValidationTests.FieldMaxLength: has 400 status': (r) => r.status === 400,
      'ValidationTests.FieldMaxLength: response contains error': (r) =>
        r.error != null,
      'ValidationTests.FieldMaxLength: has max length validator message': (r) =>
        (r.error.errors?.fieldName?.includes(FIELD_MAX_LENGTH_ERROR)) ?? false,
    });
  }

  // GreaterThanOrEqual validation (for pagination)
  PageGreaterThanOrEqualValidation() {
    const params = {
      FieldName: 'test',
      Page: 0,  // Invalid - must be >= 1
      PageSize: 5,
    };

    const response = apiAuthenticatedClient.GETEndpoint(params);

    check(response, {
      'ValidationTests.PageGreaterThan: has 400 status': (r) => r.status === 400,
      'ValidationTests.PageGreaterThan: response contains error': (r) =>
        r.error != null,
      'ValidationTests.PageGreaterThan: has greater than validator': (r) =>
        (r.error.errors?.page?.includes(PAGE_GREATER_THAN_ERROR)) ?? false,
    });
  }

  // Enum validation
  EnumFieldValidation() {
    const params = {
      EnumField: INVALID_ENUM_VALUE,  // Invalid enum value
      Page: 1,
      PageSize: 5,
    };

    const response = apiAuthenticatedClient.GETEndpoint(params);

    check(response, {
      'ValidationTests.EnumField: has 400 status': (r) => r.status === 400,
      'ValidationTests.EnumField: response contains error': (r) =>
        r.error != null,
      'ValidationTests.EnumField: has enum validator message': (r) =>
        (r.error.errors?.enumField?.includes(ENUM_INVALID_ERROR)) ?? false,
    });
  }

  // Date range validation (startDate <= endDate)
  DateRangeValidation() {
    const params = {
      StartDate: '2025-12-31',  // After end date - invalid
      EndDate: '2025-01-01',
      Page: 1,
      PageSize: 5,
    };

    const response = apiAuthenticatedClient.GETEndpoint(params);

    check(response, {
      'ValidationTests.DateRange: has 400 status': (r) => r.status === 400,
      'ValidationTests.DateRange: response contains error': (r) =>
        r.error != null,
      'ValidationTests.DateRange: has date range validator': (r) =>
        r.error.errors?.startDate != null,
    });
  }
}
```

---

## KEY PATTERNS TO FOLLOW

### Naming Convention

- Check names format: `'ClassName.MethodName: description'`
- Always include class and method name for easy debugging in test reports

### Check Patterns

| Pattern | Code |
|---------|------|
| Status code check | `(r) => r.status === 200` |
| Data existence | `(r) => r.data !== null && r.data !== undefined` |
| Array has items | `(r) => r.data.items.length > 0` |
| Contains specific item | `(r) => r.data.items.some((item) => item.field === expected)` |
| All items match | `(r) => r.data.items.every((item) => item.field === expected)` |
| Object has property | `(r) => Object.hasOwn(r.data, 'propertyName')` |
| Includes substring | `(r) => r.data.field?.includes('substring')` |

### Validation Error Access

- Errors are located in: `r.error.errors?.fieldName`
- Use nullish coalescing for safety: `?.includes(...) ?? false`
- Field names in errors use camelCase (e.g., `searchTerm`, `clientsPage`)

### Test Categories

| Category | Input | Expected Status | Verify |
|----------|-------|-----------------|--------|
| **Happy Path** | Valid inputs | 200 | Response data structure and values |
| **Negative Tests** | Nonsense/non-existent values | 200 | Empty results |
| **Unauthorized** | No auth token | 401 | Status only |
| **Validation** | Invalid inputs | 400 | Error messages match FluentValidation |

### API Clients

- `apiAuthenticatedClient` - for authenticated requests (use for happy path, validation tests)
- `apiUnauthenticated` - for 401 unauthorized tests

---

## COMMON VALIDATION ERROR MESSAGE FORMATS

FluentValidation generates these standard message formats:

```javascript
// Required field
"'fieldName' must not be empty."

// MaxLength
"The length of 'fieldName' must be 100 characters or fewer. You entered 101 characters."

// GreaterThanOrEqualTo
"'fieldName' must be greater than or equal to '1'."

// LessThanOrEqualTo
"'fieldName' must be less than or equal to '100'."

// Enum validation
"'fieldName' has a range of values which does not include '999999'."

// Date comparison
"'startDate' must be less than or equal to '1/1/2025'."
```

---

## EXECUTION ORDER

1. **Seed/Setup** - Create test data first
2. **Happy Path Tests** - Verify functionality with valid data
3. **Negative Tests** - Verify behavior with non-existent data
4. **Authorization Tests** - Verify 401 responses
5. **Validation Tests** - Verify 400 responses with proper error messages
6. **Cleanup** - Delete test data

---

## TIPS

1. Use `sleep()` after seeding data if the backend has async processing (e.g., event sourcing, search indexing)
2. Define all constants at the top of the file for easy maintenance
3. Group related tests using nested `group()` calls for organized reporting
4. Always check both status AND response structure/content
5. For enum validation, use a clearly invalid number like `999999`
6. For MaxLength validation, use a string exactly 1 character over the limit

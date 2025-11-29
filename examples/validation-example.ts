/**
 * Validation Module Examples
 *
 * This file demonstrates how to use @fjell/core validation functions
 * to ensure data integrity across the Fjell ecosystem.
 */

import {
  ComKey,
  Coordinate,
  isValidLocations,
  Item,
  LocKey,
  PriKey,
  validateComKey,
  validateKey,
  validateKeys,
  validateLocations,
  validatePK,
  validatePriKey,
} from '../src/index';
import { SchemaValidator, validateSchema, ValidationError } from '../src/validation';

/**
 * ========================================
 * Location Validation Examples
 * ========================================
 */

// Example 1: Validate location array for a two-level hierarchy
function example1_ValidateLocations() {
  // Define a coordinate with a two-level hierarchy
  const coordinate = new Coordinate(['product', 'store']);

  // Valid location array (single store location)
  const validLocations: LocKey<'store'>[] = [
    { kt: 'store', lk: 'store-123' }
  ];

  try {
    validateLocations(validLocations, coordinate, 'create');
    console.log('✓ Valid location array');
  } catch (error) {
    console.error('✗ Invalid location array:', error);
  }

  // Invalid location array (wrong order)
  const invalidLocations = [
    { kt: 'warehouse', lk: 'warehouse-456' } // wrong key type
  ] as any;

  try {
    validateLocations(invalidLocations, coordinate, 'create');
    console.log('✓ Valid location array');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error message includes:
    // - Operation name ('create')
    // - Expected hierarchy ['store']
    // - Received hierarchy ['warehouse']
    // - Position of mismatch
  }
}

// Example 2: Non-throwing validation with isValidLocations
function example2_NonThrowingValidation() {
  const coordinate = new Coordinate(['product', 'store', 'region']);

  const locations = [
    { kt: 'store', lk: 'store-1' },
    { kt: 'region', lk: 'region-1' }
  ] as any;

  // Returns ValidationResult object
  const result = isValidLocations(locations, coordinate, 'find');

  if (result.valid) {
    console.log('✓ Location array is valid');
  } else {
    console.error('✗ Validation failed:', result.error);
    // Use error message to show user-friendly validation feedback
  }
}

// Example 3: Empty and undefined location arrays
function example3_EdgeCases() {
  const coordinate = new Coordinate(['product', 'store']);

  // Empty array is valid (no location keys required)
  validateLocations([], coordinate, 'all');
  console.log('✓ Empty location array is valid');

  // No locations provided is valid (operations at root level)
  // validateLocations(undefined, coordinate, 'all');
  console.log('✓ Undefined location array is valid (skipping in example)');
}

/**
 * ========================================
 * Key Validation Examples
 * ========================================
 */

// Example 4: Validate PriKey for primary library
function example4_ValidatePriKey() {
  const coordinate = new Coordinate(['product']); // single-level = primary

  const priKey: PriKey<'product'> = {
    kt: 'product',
    pk: 'prod-123'
  };

  try {
    validateKey(priKey, coordinate, 'get');
    console.log('✓ Valid PriKey for primary library');
  } catch (error) {
    console.error('✗ Invalid key:', error);
  }

  // Invalid: ComKey for primary library
  const comKey: ComKey<'product', 'store'> = {
    kt: 'product',
    pk: 'prod-123',
    loc: [{ kt: 'store', lk: 'store-456' }]
  };

  try {
    validateKey(comKey, coordinate, 'get');
    console.log('✓ Valid key');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error: "Primary library received composite key in get"
    // Includes helpful format examples
  }
}

// Example 5: Validate ComKey for composite library
function example5_ValidateComKey() {
  const coordinate = new Coordinate(['product', 'store', 'region']);

  // Valid ComKey with correct location order
  const validComKey: ComKey<'product', 'store', 'region'> = {
    kt: 'product',
    pk: 'prod-123',
    loc: [
      { kt: 'store', lk: 'store-456' },
      { kt: 'region', lk: 'region-789' }
    ]
  };

  try {
    validateKey(validComKey, coordinate, 'update');
    console.log('✓ Valid ComKey with correct location order');
  } catch (error) {
    console.error('✗ Invalid key:', error);
  }

  // Invalid: Wrong location order
  const invalidComKey = {
    kt: 'product',
    pk: 'prod-123',
    loc: [
      { kt: 'region', lk: 'region-789' }, // wrong order!
      { kt: 'store', lk: 'store-456' }
    ]
  } as any;

  try {
    validateKey(invalidComKey, coordinate, 'update');
    console.log('✓ Valid key');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error: "Location key array order mismatch for update"
    // Shows expected vs received order
  }
}

// Example 6: Validate ComKey with partial locations (foreign key)
function example6_PartialLocations() {
  const coordinate = new Coordinate(['product', 'store', 'region']);

  // Valid: Partial location array (foreign key reference)
  const foreignKeyRef: ComKey<'product', 'store'> = {
    kt: 'product',
    pk: 'prod-123',
    loc: [{ kt: 'store', lk: 'store-456' }]
    // Missing 'region' location - this is valid for foreign keys
  };

  try {
    validateKey(foreignKeyRef, coordinate, 'get');
    console.log('✓ Valid ComKey with partial locations (foreign key)');
  } catch (error) {
    console.error('✗ Invalid key:', error);
  }

  // Invalid: Too many locations
  const tooManyLocations = {
    kt: 'product',
    pk: 'prod-123',
    loc: [
      { kt: 'store', lk: 'store-456' },
      { kt: 'region', lk: 'region-789' },
      { kt: 'country', lk: 'country-001' } // too many!
    ]
  } as any;

  try {
    validateKey(tooManyLocations, coordinate, 'get');
    console.log('✓ Valid key');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error: "Location key array length mismatch"
  }
}

/**
 * ========================================
 * Item Validation Examples
 * ========================================
 */

// Example 7: Validate item primary key type
function example7_ValidatePK() {
  const item: Item<'product'> = {
    state: { name: 'Widget', price: 9.99 },
    key: { kt: 'product', pk: 'prod-123' }
  };

  try {
    const validatedItem = validatePK(item, 'product');
    console.log('✓ Valid item with correct pk type:', validatedItem.key.kt);
  } catch (error) {
    console.error('✗ Invalid item:', error);
  }

  // Invalid: Wrong pk type
  const wrongPkItem: Item<'order'> = {
    state: { name: 'Order', total: 99.99 },
    key: { kt: 'order', pk: 'order-456' }
  };

  try {
    validatePK(wrongPkItem, 'product'); // Expecting 'product', got 'order'
    console.log('✓ Valid item');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error: "Item does not have the correct primary key type"
  }
}

// Example 8: Validate array of items
function example8_ValidateItemArray() {
  const items: Item<'product'>[] = [
    {
      state: { name: 'Widget A' },
      key: { kt: 'product', pk: 'prod-1' }
    },
    {
      state: { name: 'Widget B' },
      key: { kt: 'product', pk: 'prod-2' }
    }
  ];

  try {
    const validatedItems = validatePK(items, 'product');
    console.log('✓ Valid array of items:', validatedItems.length);
  } catch (error) {
    console.error('✗ Invalid items:', error);
  }
}

// Example 9: Validate item key type array (composite items)
function example9_ValidateKeys() {
  const item: Item<'product', 'store'> = {
    state: { name: 'Widget', price: 9.99 },
    key: {
      kt: 'product',
      pk: 'prod-123',
      loc: [{ kt: 'store', lk: 'store-456' }]
    }
  };

  try {
    const validatedItem = validateKeys(item, ['product', 'store']);
    console.log('✓ Valid item with correct key type array', validatedItem.key.kt);
  } catch (error) {
    console.error('✗ Invalid item:', error);
  }

  // Invalid: Wrong key type array
  try {
    validateKeys(item, ['product', 'warehouse']); // Expected 'warehouse', got 'store'
    console.log('✓ Valid item');
  } catch (error) {
    console.error('✗ Expected error:', (error as Error).message);
    // Error: "Item does not have the correct key types"
  }
}

/**
 * ========================================
 * Real-World Usage Patterns
 * ========================================
 */

// Example 10: Validation in operations
function example10_OperationValidation() {
  const coordinate = new Coordinate(['product', 'store']);

  // In a 'create' operation
  function createProduct(
    locations: LocKey<'store'>[],
    data: any
  ): Item<'product', 'store'> {
    // Validate locations before proceeding
    validateLocations(locations, coordinate, 'create');

    // Create item with validated locations
    const item: Item<'product', 'store'> = {
      state: data,
      key: {
        kt: 'product',
        pk: `prod-${Date.now()}`,
        loc: locations
      }
    };

    return item;
  }

  try {
    const item = createProduct(
      [{ kt: 'store', lk: 'store-123' }],
      { name: 'Widget', price: 9.99 }
    );
    console.log('✓ Created product:', item.key.pk);
  } catch (error) {
    console.error('✗ Failed to create product:', (error as Error).message);
  }
}

// Example 11: Validation with error handling
function example11_ErrorHandling() {
  const coordinate = new Coordinate(['product', 'store']);

  function safeOperation(locations: any): boolean {
    // Use non-throwing validation for graceful error handling
    const result = isValidLocations(locations, coordinate, 'find');

    if (!result.valid) {
      // Log error or show user-friendly message
      console.warn('Invalid locations:', result.error);
      return false;
    }

    // Proceed with operation
    console.log('✓ Proceeding with valid locations');
    return true;
  }

  // Test with valid locations
  safeOperation([{ kt: 'store', lk: 'store-1' }]);

  // Test with invalid locations
  safeOperation([{ kt: 'warehouse', lk: 'warehouse-1' }]);
}

// Example 12: Using specific validators
function example12_SpecificValidators() {
  const coordinate = new Coordinate(['product']);

  const priKey: PriKey<'product'> = {
    kt: 'product',
    pk: 'prod-123'
  };

  // Use specific validator when you know the key type
  try {
    validatePriKey(priKey, coordinate, 'remove');
    console.log('✓ Valid PriKey');
  } catch (error) {
    console.error('✗ Invalid PriKey:', error);
  }

  // For composite keys
  const coordinate2 = new Coordinate(['product', 'store']);
  const comKey: ComKey<'product', 'store'> = {
    kt: 'product',
    pk: 'prod-123',
    loc: [{ kt: 'store', lk: 'store-456' }]
  };

  try {
    validateComKey(comKey, coordinate2, 'action');
    console.log('✓ Valid ComKey');
  } catch (error) {
    console.error('✗ Invalid ComKey:', error);
  }
}

/**
 * ========================================
 * Schema Validation Examples (Zod, etc.)
 * ========================================
 */

// Example 13: Schema validation with Zod (if zod is installed)
async function example13_ZodSchemaValidation() {
  // Note: This example assumes zod is installed
  // In real usage, you would: import { z } from 'zod';
  
  // Mock Zod schema for demonstration
  const mockZodSchema: SchemaValidator<{ name: string; age: number; email?: string }> = {
    parse: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'name' in data && 'age' in data) {
        const obj = data as any;
        if (typeof obj.name === 'string' && obj.name.length >= 3 &&
            typeof obj.age === 'number' && obj.age >= 18) {
          return { name: obj.name, age: obj.age, email: obj.email };
        }
      }
      throw { issues: [{ path: [], message: 'Invalid data', code: 'custom' }] };
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: mockZodSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  // Valid data
  try {
    const validated = await validateSchema(
      { name: 'Alice', age: 25, email: 'alice@example.com' },
      mockZodSchema
    );
    console.log('✓ Valid data:', validated);
  } catch (error) {
    console.error('✗ Validation failed:', error);
  }

  // Invalid data
  try {
    await validateSchema({ name: 'Al', age: 10 }, mockZodSchema);
    console.log('✓ Valid data');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('✗ Expected ValidationError:', error.message);
      console.error('  Field errors:', error.fieldErrors);
    }
  }
}

// Example 14: Schema validation without schema (passthrough)
async function example14_NoSchema() {
  const data = { name: 'Bob', age: 30 };
  
  // When no schema is provided, data is returned as-is
  const result = await validateSchema(data);
  console.log('✓ Data returned as-is:', result);
  // Result equals original data when no schema provided
}

// Example 15: Schema validation in cache layer
async function example15_CacheValidation() {
  const userSchema: SchemaValidator<{ id: string; name: string }> = {
    parse: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'id' in data && 'name' in data) {
        return data as { id: string; name: string };
      }
      throw new Error('Invalid user data');
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: userSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  // Validate before caching
  const userData = { id: 'user-123', name: 'Charlie' };
  try {
    const validatedUser = await validateSchema(userData, userSchema);
    // await cache.set(`user:${validatedUser.id}`, validatedUser);
    console.log('✓ User validated and ready for cache:', validatedUser);
  } catch (error) {
    console.error('✗ Cannot cache invalid user:', error);
  }
}

// Example 16: Schema validation in API layer
async function example16_APIValidation() {
  const responseSchema: SchemaValidator<{ status: string; data: any }> = {
    parse: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'status' in data) {
        return data as { status: string; data: any };
      }
      throw new Error('Invalid API response');
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: responseSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  // Validate API response before sending to client
  const apiResponse = { status: 'success', data: { message: 'Hello' } };
  try {
    const validatedResponse = await validateSchema(apiResponse, responseSchema);
    // return res.json(validatedResponse);
    console.log('✓ API response validated:', validatedResponse);
  } catch (error) {
    console.error('✗ Cannot send invalid response:', error);
  }
}

/**
 * Run all examples
 */
export function runAllValidationExamples() {
  console.log('\n=== Location Validation Examples ===');
  example1_ValidateLocations();
  example2_NonThrowingValidation();
  example3_EdgeCases();

  console.log('\n=== Key Validation Examples ===');
  example4_ValidatePriKey();
  example5_ValidateComKey();
  example6_PartialLocations();

  console.log('\n=== Item Validation Examples ===');
  example7_ValidatePK();
  example8_ValidateItemArray();
  example9_ValidateKeys();

  console.log('\n=== Real-World Usage Patterns ===');
  example10_OperationValidation();
  example11_ErrorHandling();
  example12_SpecificValidators();

  console.log('\n=== Schema Validation Examples ===');
  example13_ZodSchemaValidation();
  example14_NoSchema();
  example15_CacheValidation();
  example16_APIValidation();
}

// Uncomment to run examples
// runAllValidationExamples();


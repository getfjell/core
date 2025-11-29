/**
 * Schema Validation Examples
 *
 * Demonstrates how to use @fjell/core schema validation with Zod and other validators.
 * Schema validation is available throughout the Fjell ecosystem for validating data
 * at system boundaries (cache, APIs, persistence, etc.).
 */

import { SchemaValidator, validateSchema, ValidationError } from '../src/validation';

/**
 * ========================================
 * Basic Schema Validation
 * ========================================
 */

// Example 1: Basic Zod-like schema validation
async function example1_BasicValidation() {
  // Create a mock schema validator (in real usage, use Zod: z.object({...}))
  const userSchema: SchemaValidator<{ name: string; age: number }> = {
    parse: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'name' in data && 'age' in data) {
        const obj = data as any;
        if (typeof obj.name === 'string' && typeof obj.age === 'number') {
          return { name: obj.name, age: obj.age };
        }
      }
      throw { issues: [{ path: [], message: 'Invalid user data', code: 'custom' }] };
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: userSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  // Valid data
  try {
    const validated = await validateSchema(
      { name: 'Alice', age: 25 },
      userSchema
    );
    console.log('✓ Valid user:', validated);
  } catch (error) {
    console.error('✗ Validation failed:', error);
  }

  // Invalid data
  try {
    await validateSchema({ name: 'Bob' }, userSchema); // Missing age
    console.log('✓ Valid');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('✗ ValidationError:', error.message);
      console.error('  Field errors:', error.fieldErrors);
    }
  }
}

/**
 * ========================================
 * Using in Cache Layer
 * ========================================
 */

// Example 2: Validate before caching
async function example2_CacheValidation() {
  const productSchema: SchemaValidator<{ id: string; name: string; price: number }> = {
    parse: (data: unknown) => {
      const obj = data as any;
      if (obj?.id && obj?.name && typeof obj.price === 'number') {
        return { id: String(obj.id), name: String(obj.name), price: Number(obj.price) };
      }
      throw { issues: [{ path: [], message: 'Invalid product', code: 'custom' }] };
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: productSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  const productData = { id: 'prod-123', name: 'Widget', price: 9.99 };

  try {
    // Validate before caching
    const validatedProduct = await validateSchema(productData, productSchema);
    
    // Now safe to cache
    // await cache.set(`product:${validatedProduct.id}`, validatedProduct);
    console.log('✓ Product validated and ready for cache:', validatedProduct);
  } catch (error) {
    console.error('✗ Cannot cache invalid product:', error);
    // Don't cache invalid data
  }
}

/**
 * ========================================
 * Using in API Layer
 * ========================================
 */

// Example 3: Validate API responses before sending to clients
async function example3_APIResponseValidation() {
  const responseSchema: SchemaValidator<{ status: string; data: any; timestamp: string }> = {
    parse: (data: unknown) => {
      const obj = data as any;
      if (obj?.status && 'data' in obj) {
        return {
          status: String(obj.status),
          data: obj.data,
          timestamp: obj.timestamp || new Date().toISOString()
        };
      }
      throw { issues: [{ path: [], message: 'Invalid API response', code: 'custom' }] };
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: responseSchema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  const apiResponse = {
    status: 'success',
    data: { message: 'Hello, world!' },
    timestamp: new Date().toISOString()
  };

  try {
    // Validate before sending to client
    const validatedResponse = await validateSchema(apiResponse, responseSchema);
    
    // Now safe to send
    // return res.json(validatedResponse);
    console.log('✓ API response validated:', validatedResponse);
  } catch (error) {
    console.error('✗ Cannot send invalid response:', error);
    // Return error response instead
  }
}

/**
 * ========================================
 * Error Handling
 * ========================================
 */

// Example 4: Handling validation errors
async function example4_ErrorHandling() {
  const schema: SchemaValidator<{ email: string }> = {
    parse: (data: unknown) => {
      const obj = data as any;
      if (obj?.email && typeof obj.email === 'string' && obj.email.includes('@')) {
        return { email: obj.email };
      }
      throw {
        issues: [
          { path: ['email'], message: 'Invalid email format', code: 'invalid_string' }
        ]
      };
    },
    safeParse: (data: unknown) => {
      try {
        return { success: true as const, data: schema.parse(data) };
      } catch (error) {
        return { success: false as const, error };
      }
    }
  };

  try {
    await validateSchema({ email: 'invalid-email' }, schema);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:');
      console.error('  Message:', error.message);
      console.error('  Field errors:', error.fieldErrors);
      
      // Access individual field errors
      error.fieldErrors?.forEach(fieldError => {
        console.error(`  - ${fieldError.path.join('.')}: ${fieldError.message} (${fieldError.code})`);
      });
    }
  }
}

/**
 * ========================================
 * No Schema (Passthrough)
 * ========================================
 */

// Example 5: Using without schema
async function example5_NoSchema() {
  const data = { name: 'Bob', age: 30, customField: 'anything' };

  // When no schema is provided, data is returned as-is
  const result = await validateSchema(data);
  console.log('✓ Data returned as-is:', result);
  // Useful for optional validation or when schema is determined at runtime
}

/**
 * ========================================
 * Async Validation
 * ========================================
 */

// Example 6: Using async validation
async function example6_AsyncValidation() {
  const asyncSchema: SchemaValidator<{ id: string }> = {
    parse: () => {
      throw new Error('Should use parseAsync');
    },
    safeParse: () => {
      throw new Error('Should use parseAsync');
    },
    parseAsync: async (data: unknown) => {
      // Simulate async validation (e.g., checking database)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const obj = data as any;
      if (obj?.id) {
        return { id: String(obj.id) };
      }
      throw {
        issues: [{ path: ['id'], message: 'ID required', code: 'required' }]
      };
    }
  };

  try {
    const validated = await validateSchema({ id: 'test-123' }, asyncSchema);
    console.log('✓ Async validation successful:', validated);
  } catch (error) {
    console.error('✗ Async validation failed:', error);
  }
}

/**
 * ========================================
 * Real-World Integration
 * ========================================
 */

// Example 7: Integration with @fjell/lib operations
async function example7_LibIntegration() {
  // When using @fjell/lib, schema validation is automatically applied
  // in create and update operations via the Options.validation.schema
  
  console.log(`
  // In your library setup:
  import { createOptions } from '@fjell/lib';
  import { z } from 'zod';
  
  const userSchema = z.object({
    name: z.string().min(3),
    age: z.number().min(18)
  });
  
  const options = createOptions({
    validation: {
      schema: userSchema,
      updateSchema: userSchema.partial()
    }
  });
  
  // Now create/update operations automatically validate
  // await lib.operations.create({ name: 'Alice', age: 25 });
  `);
}

/**
 * Run all examples
 */
export async function runAllSchemaValidationExamples() {
  console.log('\n=== Basic Schema Validation ===');
  await example1_BasicValidation();

  console.log('\n=== Cache Layer Validation ===');
  await example2_CacheValidation();

  console.log('\n=== API Layer Validation ===');
  await example3_APIResponseValidation();

  console.log('\n=== Error Handling ===');
  await example4_ErrorHandling();

  console.log('\n=== No Schema (Passthrough) ===');
  await example5_NoSchema();

  console.log('\n=== Async Validation ===');
  await example6_AsyncValidation();

  console.log('\n=== Lib Integration ===');
  await example7_LibIntegration();
}

// Uncomment to run examples
// runAllSchemaValidationExamples();


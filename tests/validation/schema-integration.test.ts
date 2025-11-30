/**
 * Integration tests for schema validation
 *
 * Verifies that schema validation works correctly when used
 * through @fjell/lib operations (simulating real-world usage)
 */

import { describe, expect, it } from 'vitest';
import { SchemaValidator, validateSchema } from '../../src/validation';
import { ValidationError } from '../../src/errors';

describe('Schema Validation Integration', () => {
  describe('Real-world usage patterns', () => {
    it('should validate data before caching', async () => {
      const cacheSchema: SchemaValidator<{ id: string; value: string }> = {
        parse: (data: unknown) => {
          const obj = data as any;
          if (obj?.id && obj?.value) {
            return { id: String(obj.id), value: String(obj.value) };
          }
          throw { issues: [{ path: [], message: 'Invalid cache data', code: 'custom' }] };
        },
        safeParse: (data: unknown) => {
          try {
            return { success: true as const, data: cacheSchema.parse(data) };
          } catch (error) {
            return { success: false as const, error };
          }
        }
      };

      const data = { id: 'key-1', value: 'cached-value' };
      const validated = await validateSchema(data, cacheSchema);
      
      expect(validated).toEqual(data);
      // In real usage: await cache.set(validated.id, validated);
    });

    it('should validate API responses', async () => {
      const apiSchema: SchemaValidator<{ status: string; data: any }> = {
        parse: (data: unknown) => {
          const obj = data as any;
          if (obj?.status) {
            return { status: String(obj.status), data: obj.data };
          }
          throw { issues: [{ path: ['status'], message: 'Status required', code: 'required' }] };
        },
        safeParse: (data: unknown) => {
          try {
            return { success: true as const, data: apiSchema.parse(data) };
          } catch (error) {
            return { success: false as const, error };
          }
        }
      };

      const response = { status: 'success', data: { message: 'Hello' } };
      const validated = await validateSchema(response, apiSchema);
      
      expect(validated.status).toBe('success');
      expect(validated.data).toEqual({ message: 'Hello' });
    });

    it('should work with async validation', async () => {
      let asyncCalled = false;
      const asyncSchema: SchemaValidator<{ id: string }> = {
        parse: () => {
          throw new Error('Should use parseAsync');
        },
        safeParse: () => {
          throw new Error('Should use parseAsync');
        },
        parseAsync: async (data: unknown) => {
          asyncCalled = true;
          await new Promise(resolve => setTimeout(resolve, 10));
          const obj = data as any;
          if (obj?.id) {
            return { id: String(obj.id) };
          }
          throw { issues: [{ path: ['id'], message: 'ID required', code: 'required' }] };
        }
      };

      const validated = await validateSchema({ id: 'test-123' }, asyncSchema);
      
      expect(asyncCalled).toBe(true);
      expect(validated.id).toBe('test-123');
    });
  });

  describe('Error handling integration', () => {
    it('should transform Zod-like errors correctly', async () => {
      const schema: SchemaValidator<{ email: string }> = {
        parse: () => {
          throw {
            issues: [
              { path: ['email'], message: 'Invalid email', code: 'invalid_string' },
              { path: ['name'], message: 'Required', code: 'required' }
            ]
          };
        },
        safeParse: () => {
          return {
            success: false as const,
            error: {
              issues: [
                { path: ['email'], message: 'Invalid email', code: 'invalid_string' },
                { path: ['name'], message: 'Required', code: 'required' }
              ]
            }
          };
        }
      };

      try {
        await validateSchema({ email: 'invalid' }, schema);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.fieldErrors).toHaveLength(2);
        expect(validationError.fieldErrors![0].path).toEqual(['email']);
        expect(validationError.fieldErrors![1].path).toEqual(['name']);
      }
    });
  });

  describe('Backward compatibility', () => {
    it('should work without schema (passthrough)', async () => {
      const data = { any: 'data', structure: 123 };
      const result = await validateSchema(data);
      
      expect(result).toEqual(data);
    });

    it('should maintain function signature compatibility', async () => {
      // Verify the function signature matches what lib expects
      const schema: SchemaValidator<{ test: string }> = {
        parse: (data: unknown) => ({ test: String((data as any).test) }),
        safeParse: (data: unknown) => {
          try {
            return { success: true as const, data: schema.parse(data) };
          } catch (error) {
            return { success: false as const, error };
          }
        }
      };

      // Should work exactly as before
      const result = await validateSchema({ test: 'value' }, schema);
      expect(result.test).toBe('value');
    });
  });
});


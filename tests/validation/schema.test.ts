import { describe, expect, it } from 'vitest';
import { SchemaValidator, validateSchema } from '../../src/validation/schema';
import { ValidationError } from '../../src/errors';

describe('validateSchema', () => {
  describe('with valid data', () => {
    it('should return data when schema is not provided', async () => {
      const data = { name: 'Alice', age: 25 };
      const result = await validateSchema(data);
      expect(result).toEqual(data);
    });

    it('should validate and return data with sync parse', async () => {
      const mockSchema: SchemaValidator<{ name: string; age: number }> = {
        parse: (data: unknown) => {
          if (typeof data === 'object' && data !== null && 'name' in data && 'age' in data) {
            return data as { name: string; age: number };
          }
          throw new Error('Invalid data');
        },
        safeParse: (data: unknown) => {
          if (typeof data === 'object' && data !== null && 'name' in data && 'age' in data) {
            return { success: true as const, data: data as { name: string; age: number } };
          }
          return { success: false as const, error: new Error('Invalid data') };
        }
      };

      const data = { name: 'Alice', age: 25 };
      const result = await validateSchema(data, mockSchema);
      expect(result).toEqual(data);
    });

    it('should validate and return data with safeParse', async () => {
      const mockSchema: SchemaValidator<{ name: string }> = {
        parse: () => {
          throw new Error('Should not use parse');
        },
        safeParse: (data: unknown) => {
          if (typeof data === 'object' && data !== null && 'name' in data) {
            return { success: true as const, data: { name: (data as { name: unknown }).name as string } };
          }
          return { success: false as const, error: new Error('Invalid data') };
        }
      };

      const data = { name: 'Bob' };
      const result = await validateSchema(data, mockSchema);
      expect(result).toEqual(data);
    });

    it('should prefer parseAsync when available', async () => {
      let parseAsyncCalled = false;
      const mockSchema: SchemaValidator<{ name: string }> = {
        parse: () => {
          throw new Error('Should not use parse');
        },
        safeParse: () => {
          throw new Error('Should not use safeParse');
        },
        parseAsync: async (data: unknown) => {
          parseAsyncCalled = true;
          if (typeof data === 'object' && data !== null && 'name' in data) {
            return { name: (data as { name: unknown }).name as string };
          }
          throw new Error('Invalid data');
        }
      };

      const data = { name: 'Charlie' };
      const result = await validateSchema(data, mockSchema);
      expect(result).toEqual(data);
      expect(parseAsyncCalled).toBe(true);
    });
  });

  describe('with invalid data', () => {
    it('should throw ValidationError with FieldError[] for Zod-like errors', async () => {
      const mockZodError = {
        issues: [
          { path: ['name'], message: 'Required', code: 'invalid_type' },
          { path: ['age'], message: 'Expected number, received string', code: 'invalid_type' }
        ]
      };

      const mockSchema: SchemaValidator<{ name: string; age: number }> = {
        parse: () => {
          throw mockZodError;
        },
        safeParse: () => {
          return { success: false as const, error: mockZodError };
        }
      };

      const data = { name: '', age: 'not-a-number' };
      
      await expect(validateSchema(data, mockSchema)).rejects.toThrow(ValidationError);
      
      try {
        await validateSchema(data, mockSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.fieldErrors).toBeDefined();
        expect(validationError.fieldErrors).toHaveLength(2);
        expect(validationError.fieldErrors![0]).toEqual({
          path: ['name'],
          message: 'Required',
          code: 'invalid_type'
        });
        expect(validationError.fieldErrors![1]).toEqual({
          path: ['age'],
          message: 'Expected number, received string',
          code: 'invalid_type'
        });
      }
    });

    it('should throw ValidationError for non-Zod errors', async () => {
      const mockSchema: SchemaValidator<{ name: string }> = {
        parse: () => {
          throw new Error('Custom validation error');
        },
        safeParse: () => {
          return { success: false as const, error: new Error('Custom validation error') };
        }
      };

      const data = { invalid: 'data' };
      
      await expect(validateSchema(data, mockSchema)).rejects.toThrow(ValidationError);
      
      try {
        await validateSchema(data, mockSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain('Validation failed');
      }
    });

    it('should re-throw existing ValidationError', async () => {
      const existingError = new ValidationError('Already a ValidationError');
      
      const mockSchema: SchemaValidator<{ name: string }> = {
        parse: () => {
          throw existingError;
        },
        safeParse: () => {
          return { success: false as const, error: existingError };
        }
      };

      const data = { name: 'Test' };
      
      await expect(validateSchema(data, mockSchema)).rejects.toBe(existingError);
    });

    it('should handle errors without message', async () => {
      const mockSchema: SchemaValidator<{ name: string }> = {
        parse: () => {
          throw { toString: () => 'Unknown error' };
        },
        safeParse: () => {
          return { success: false as const, error: { toString: () => 'Unknown error' } };
        }
      };

      const data = { invalid: 'data' };
      
      await expect(validateSchema(data, mockSchema)).rejects.toThrow(ValidationError);
      
      try {
        await validateSchema(data, mockSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain('Unknown error');
      }
    });
  });

  describe('error transformation', () => {
    it('should correctly transform ZodError issues to FieldError[]', async () => {
      const mockZodError = {
        issues: [
          { path: ['user', 'email'], message: 'Invalid email', code: 'invalid_string' },
          { path: ['user', 'age'], message: 'Must be 18 or older', code: 'too_small' },
          { path: ['tags', 0], message: 'Expected string', code: 'invalid_type' }
        ]
      };

      const mockSchema: SchemaValidator<any> = {
        parse: () => {
          throw mockZodError;
        },
        safeParse: () => {
          return { success: false as const, error: mockZodError };
        }
      };

      const data = { user: { email: 'invalid', age: 15 }, tags: [123] };
      
      try {
        await validateSchema(data, mockSchema);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.fieldErrors).toHaveLength(3);
        expect(validationError.fieldErrors![0].path).toEqual(['user', 'email']);
        expect(validationError.fieldErrors![1].path).toEqual(['user', 'age']);
        expect(validationError.fieldErrors![2].path).toEqual(['tags', 0]);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null data', async () => {
      const mockSchema: SchemaValidator<null> = {
        parse: (data: unknown) => {
          if (data === null) return null;
          throw new Error('Expected null');
        },
        safeParse: (data: unknown) => {
          if (data === null) {
            return { success: true as const, data: null };
          }
          return { success: false as const, error: new Error('Expected null') };
        }
      };

      const result = await validateSchema(null, mockSchema);
      expect(result).toBeNull();
    });

    it('should handle undefined data', async () => {
      const result = await validateSchema(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle primitive values', async () => {
      const mockSchema: SchemaValidator<string> = {
        parse: (data: unknown) => {
          if (typeof data === 'string') return data;
          throw new Error('Expected string');
        },
        safeParse: (data: unknown) => {
          if (typeof data === 'string') {
            return { success: true as const, data: data };
          }
          return { success: false as const, error: new Error('Expected string') };
        }
      };

      const result = await validateSchema('test', mockSchema);
      expect(result).toBe('test');
    });

    it('should handle arrays', async () => {
      const mockSchema: SchemaValidator<string[]> = {
        parse: (data: unknown) => {
          if (Array.isArray(data)) return data as string[];
          throw new Error('Expected array');
        },
        safeParse: (data: unknown) => {
          if (Array.isArray(data)) {
            return { success: true as const, data: data as string[] };
          }
          return { success: false as const, error: new Error('Expected array') };
        }
      };

      const data = ['a', 'b', 'c'];
      const result = await validateSchema(data, mockSchema);
      expect(result).toEqual(data);
    });
  });
});


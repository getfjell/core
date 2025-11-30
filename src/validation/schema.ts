import { FieldError, ValidationError } from "../errors";
import { SchemaValidator } from "./types";

/**
 * Validates data against a schema validator (Zod, Yup, etc.)
 *
 * Supports both synchronous and asynchronous validation.
 * Transforms validator errors into Fjell ValidationError with FieldError[].
 *
 * @template T - The validated/parsed type
 * @param data - The data to validate
 * @param schema - Optional schema validator
 * @returns Promise resolving to validated/parsed data
 * @throws ValidationError if validation fails
 *
 * @example
 * ```typescript
 * import { validateSchema } from '@fjell/core/validation';
 * import { z } from 'zod';
 *
 * const schema = z.object({ name: z.string() });
 * const validated = await validateSchema({ name: 'Alice' }, schema);
 * ```
 */
export async function validateSchema<T>(
  data: unknown,
  schema?: SchemaValidator<T>
): Promise<T> {
  if (!schema) {
    return data as T;
  }

  // Handle Zod-like schemas
  try {
    // Prefer async validation if available
    if (schema.parseAsync) {
      return await schema.parseAsync(data);
    }
    
    // Fall back to safeParse (non-throwing)
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      // It's an error, throw it to be caught below
      throw result.error;
    }
  } catch (error: any) {
    // Check if it's a ZodError (has issues property)
    if (error && Array.isArray(error.issues)) {
      const fieldErrors: FieldError[] = error.issues.map((issue: any) => ({
        path: issue.path,
        message: issue.message,
        code: issue.code
      }));
      
      // Explicitly constructing the error with all fields
      const validationError = new ValidationError(
        "Schema validation failed",
        // eslint-disable-next-line no-undefined
        undefined,
        // eslint-disable-next-line no-undefined
        undefined,
        // eslint-disable-next-line no-undefined
        undefined,
        fieldErrors
      );
      
      throw validationError;
    }
    
    // Re-throw if it's already a ValidationError or unknown error
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Fallback for non-Zod errors
    throw new ValidationError(`Validation failed: ${error.message || "Unknown error"}`);
  }
}


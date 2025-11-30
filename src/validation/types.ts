/**
 * Shared validation types and options
 */

/**
 * Options for validation functions
 */
export interface ValidationOptions {
  /**
   * Custom error message prefix
   */
  errorPrefix?: string;
  
  /**
   * Whether to allow undefined (treated as empty array for location validation)
   */
  allowUndefined?: boolean;
  
  /**
   * Whether to throw errors or return validation results
   * @default true
   */
  throwOnError?: boolean;
}

/**
 * Result of a validation operation (for non-throwing mode)
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  valid: boolean;
  
  /**
   * Error message if validation failed
   */
  error?: string;
  
  /**
   * Detailed validation context
   */
  context?: Record<string, unknown>;
}

/**
 * Generic interface for schema validators (Zod, Yup, Joi, etc.)
 *
 * This interface enables duck typing - any validator that implements
 * these methods will work with validateSchema.
 *
 * @template T - The validated/parsed type
 */
export interface SchemaValidator<T> {
  /**
   * Synchronous parse method.
   * Should throw an error if invalid, or return the parsed data.
   */
  parse: (data: unknown) => T;
  
  /**
   * Safe parse method that returns a result object instead of throwing.
   * Used as fallback if parseAsync is not available.
   */
  safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: any };
  
  /**
   * Optional asynchronous parse method.
   * Preferred over parse/safeParse if available.
   */
  parseAsync?: (data: unknown) => Promise<T>;
}


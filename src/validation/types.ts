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


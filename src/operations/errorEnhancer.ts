import { ActionError, ErrorInfo } from "../errors/ActionError";
import { OperationContext } from "./OperationContext";
import { ComKey, PriKey } from "@fjell/types";

/**
 * Executes an async operation and enhances any ActionError thrown with operation context.
 *
 * This is the primary utility for wrapping operations across all fjell packages.
 *
 * @param operation - The async operation to execute
 * @param context - The operation context to add to any errors
 * @returns The result of the operation
 * @throws Enhanced ActionError or original error
 *
 * @example
 * ```typescript
 * // In fjell/lib
 * return executeWithContext(
 *   () => toWrap.get(key),
 *   {
 *     itemType: 'user',
 *     operationType: 'get',
 *     operationName: 'get',
 *     params: { key },
 *     key
 *   }
 * );
 *
 * // In express-router
 * return executeWithContext(
 *   () => operations.action('approve', params, key),
 *   {
 *     itemType: 'invoice',
 *     operationType: 'action',
 *     operationName: 'approve',
 *     params,
 *     key
 *   }
 * );
 * ```
 */
export async function executeWithContext<T>(
  operation: () => Promise<T>,
  context: OperationContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw enhanceError(error as Error, context);
  }
}

/**
 * Synchronous version of executeWithContext for non-async operations.
 *
 * @param operation - The sync operation to execute
 * @param context - The operation context to add to any errors
 * @returns The result of the operation
 * @throws Enhanced ActionError or original error
 */
export function executeWithContextSync<T>(
  operation: () => T,
  context: OperationContext
): T {
  try {
    return operation();
  } catch (error) {
    throw enhanceError(error as Error, context);
  }
}

/**
 * Enhances an error with operation context if it's an ActionError.
 * If it's not an ActionError, returns the original error unchanged.
 *
 * This allows database implementations and business logic to throw
 * ActionErrors with minimal context, and have that context filled in
 * by the operation wrapper.
 *
 * @param error - The error to enhance
 * @param context - The operation context to add
 * @returns The enhanced or original error
 */
export function enhanceError(error: Error, context: OperationContext): Error {
  if (!(error instanceof ActionError)) {
    // Not an ActionError, return as-is
    return error;
  }

  // Fill in operation context
  error.errorInfo.operation = {
    type: context.operationType,
    name: context.operationName,
    params: context.params
  };

  // Fill in item type (allow override if already set)
  if (!error.errorInfo.context.itemType) {
    error.errorInfo.context.itemType = context.itemType;
  }

  // Add key context if available and not already set (or if existing key has no meaningful data)
  if (context.key) {
    const existingKey = error.errorInfo.context.key;
    const hasNoPrimaryKey = !existingKey || typeof existingKey.primary === 'undefined';
    const hasNoCompositeKey = !existingKey || !existingKey.composite;
    const shouldOverride = hasNoPrimaryKey && hasNoCompositeKey;
    
    if (shouldOverride) {
      error.errorInfo.context.key = extractKeyInfo(context.key);
    }
  }

  // Add location context if available and not already set
  if (context.locations && context.locations.length > 0 && !error.errorInfo.context.parentLocation) {
    error.errorInfo.context.parentLocation = {
      id: context.locations[0].lk,
      type: context.locations[0].kt
    };
  }

  return error;
}

/**
 * Extracts key information from a PriKey or ComKey for error context.
 *
 * @param key - The key to extract information from
 * @returns The extracted key information
 */
function extractKeyInfo(
  key: PriKey<any> | ComKey<any, any, any, any, any, any>
): NonNullable<ErrorInfo['context']['key']> {
  // Check if it's a ComKey (has loc property)
  if ('loc' in key) {
    // Composite key - convert from ComKey format to error info format
    const ktaArray = Array.isArray(key.kt) ? key.kt : [key.kt];
    const locations = Array.isArray(key.loc) ? key.loc : [];
    
    return {
      composite: {
        sk: key.pk,
        kta: ktaArray,
        locations: locations.map(loc => ({
          lk: loc.lk,
          kt: loc.kt
        }))
      }
    };
  } else if ('pk' in key) {
    // Primary key
    return { primary: key.pk };
  }
  
  // Fallback for unknown key structure
  return { primary: JSON.stringify(key) };
}

/**
 * Type guard to check if an error is an ActionError.
 *
 * @param error - The error to check
 * @returns True if the error is an ActionError
 */
export function isActionError(error: unknown): error is ActionError {
  return error instanceof ActionError;
}

/**
 * Extracts error info from an ActionError, or creates a generic error info
 * for non-ActionErrors.
 *
 * Useful for logging and error reporting.
 *
 * @param error - The error to extract info from
 * @returns The error info
 */
export function getErrorInfo(error: unknown): any {
  if (isActionError(error)) {
    return error.toJSON();
  }

  // For non-ActionErrors, create a minimal error info
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      technical: {
        timestamp: new Date().toISOString(),
        stackTrace: error.stack
      }
    };
  }

  // For non-Error objects
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    technical: {
      timestamp: new Date().toISOString()
    }
  };
}


/**
 * Query and parameter validation
 *
 * Validates ItemQuery and OperationParams structures.
 */

import type { ItemQuery } from "../item/ItemQuery";
import type { OperationParams } from "../operations/Operations";
import LibLogger from "../logger";

const logger = LibLogger.get('validation', 'QueryValidator');

/**
 * Validates that a query parameter is a valid ItemQuery object.
 *
 * @param query - The query to validate
 * @param operation - The operation name (for error messages)
 * @throws Error if query is invalid
 *
 * @example
 * ```typescript
 * validateQuery({ filter: { status: 'active' } }, 'one');
 * ```
 */
export const validateQuery = (
  query: ItemQuery | undefined,
  operation: string
): void => {
  // undefined and null are allowed - they default to empty query
  if (typeof query === 'undefined' || query === null) {
    return;
  }
  
  if (typeof query !== 'object') {
    logger.error(`Invalid query type for ${operation}`, { query, type: typeof query });
    throw new Error(
      `[${operation}] Invalid query parameter.\n` +
      `\n` +
      `Expected: object or undefined\n` +
      `Received: ${typeof query}\n` +
      `\n` +
      `Example valid queries:\n` +
      `  {}\n` +
      `  { filter: { status: 'active' } }\n` +
      `  { limit: 10, sort: { field: 'name', order: 'asc' } }`
    );
  }
  
  if (Array.isArray(query)) {
    logger.error(`Query cannot be an array for ${operation}`, { query });
    throw new Error(
      `[${operation}] Invalid query parameter.\n` +
      `\n` +
      `Query cannot be an array.\n` +
      `Received: ${JSON.stringify(query)}`
    );
  }
  
  logger.debug(`Query validation passed for ${operation}`, { query });
};

/**
 * Validates that operation parameters are valid.
 *
 * @param params - The parameters to validate
 * @param operation - The operation name (for error messages)
 * @throws Error if parameters are invalid
 *
 * @example
 * ```typescript
 * validateOperationParams({ email: 'test@example.com' }, 'find');
 * ```
 */
export const validateOperationParams = (
  params: OperationParams | undefined,
  operation: string
): void => {
  // undefined is allowed - defaults to empty params
  if (typeof params === 'undefined') {
    return;
  }
  
  // null is not valid - must be object or undefined
  if (params === null) {
    logger.error(`Params cannot be null for ${operation}`, { params });
    throw new Error(
      `[${operation}] Invalid operation parameters.\n` +
      `\n` +
      `Parameters cannot be null.\n` +
      `Expected: object or undefined\n` +
      `Received: null\n` +
      `\n` +
      `Example valid parameters:\n` +
      `  {}\n` +
      `  { email: 'user@example.com' }\n` +
      `  { status: 'active', limit: 10 }`
    );
  }
  
  if (typeof params !== 'object') {
    logger.error(`Invalid params type for ${operation}`, { params, type: typeof params });
    throw new Error(
      `[${operation}] Invalid operation parameters.\n` +
      `\n` +
      `Expected: object or undefined\n` +
      `Received: ${typeof params}\n` +
      `\n` +
      `Example valid parameters:\n` +
      `  {}\n` +
      `  { email: 'user@example.com' }\n` +
      `  { status: 'active', limit: 10 }`
    );
  }
  
  if (Array.isArray(params)) {
    logger.error(`Params cannot be an array for ${operation}`, { params });
    throw new Error(
      `[${operation}] Invalid operation parameters.\n` +
      `\n` +
      `Parameters cannot be an array.\n` +
      `Received: ${JSON.stringify(params)}`
    );
  }
  
  // Validate parameter values are of allowed types
  for (const [key, value] of Object.entries(params)) {
    const valueType = typeof value;
    const isValidType =
      valueType === 'string' ||
      valueType === 'number' ||
      valueType === 'boolean' ||
      value instanceof Date ||
      (Array.isArray(value) && value.every(v =>
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        v instanceof Date
      ));
    
    if (!isValidType) {
      logger.error(`Invalid param value type for ${operation}`, { key, value, valueType });
      throw new Error(
        `[${operation}] Invalid value type for parameter "${key}".\n` +
        `\n` +
        `Allowed types: string, number, boolean, Date, or arrays of these types\n` +
        `Received: ${valueType}\n` +
        `Value: ${JSON.stringify(value)}`
      );
    }
  }
  
  logger.debug(`Operation params validation passed for ${operation}`, { params });
};

/**
 * Validates that a finder name is valid.
 *
 * @param finder - The finder name to validate
 * @param operation - The operation name (for error messages)
 * @throws Error if finder name is invalid
 */
export const validateFinderName = (
  finder: string | undefined,
  operation: string
): void => {
  if (!finder || typeof finder !== 'string') {
    logger.error(`Invalid finder name for ${operation}`, { finder, type: typeof finder });
    throw new Error(
      `[${operation}] Finder name must be a non-empty string.\n` +
      `\n` +
      `Received: ${JSON.stringify(finder)}`
    );
  }
  
  if (finder.trim().length === 0) {
    logger.error(`Empty finder name for ${operation}`, { finder });
    throw new Error(
      `[${operation}] Finder name cannot be empty or whitespace only.\n` +
      `\n` +
      `Received: "${finder}"`
    );
  }
  
  logger.debug(`Finder name validation passed for ${operation}`, { finder });
};

/**
 * Validates that an action name is valid.
 *
 * @param action - The action name to validate
 * @param operation - The operation name (for error messages)
 * @throws Error if action name is invalid
 */
export const validateActionName = (
  action: string | undefined,
  operation: string
): void => {
  if (!action || typeof action !== 'string') {
    logger.error(`Invalid action name for ${operation}`, { action, type: typeof action });
    throw new Error(
      `[${operation}] Action name must be a non-empty string.\n` +
      `\n` +
      `Received: ${JSON.stringify(action)}`
    );
  }
  
  if (action.trim().length === 0) {
    logger.error(`Empty action name for ${operation}`, { action });
    throw new Error(
      `[${operation}] Action name cannot be empty or whitespace only.\n` +
      `\n` +
      `Received: "${action}"`
    );
  }
  
  logger.debug(`Action name validation passed for ${operation}`, { action });
};

/**
 * Validates that a facet name is valid.
 *
 * @param facet - The facet name to validate
 * @param operation - The operation name (for error messages)
 * @throws Error if facet name is invalid
 */
export const validateFacetName = (
  facet: string | undefined,
  operation: string
): void => {
  if (!facet || typeof facet !== 'string') {
    logger.error(`Invalid facet name for ${operation}`, { facet, type: typeof facet });
    throw new Error(
      `[${operation}] Facet name must be a non-empty string.\n` +
      `\n` +
      `Received: ${JSON.stringify(facet)}`
    );
  }
  
  if (facet.trim().length === 0) {
    logger.error(`Empty facet name for ${operation}`, { facet });
    throw new Error(
      `[${operation}] Facet name cannot be empty or whitespace only.\n` +
      `\n` +
      `Received: "${facet}"`
    );
  }
  
  logger.debug(`Facet name validation passed for ${operation}`, { facet });
};


/**
 * Key validation (PriKey, ComKey)
 *
 * Validates key structures and ensures keys match the expected library type.
 */

import type { ComKey, PriKey } from "../keys";
import type { Coordinate } from "../Coordinate";
import { isComKey, isPriKey } from "../key/KUtils";
import LibLogger from "../logger";

const logger = LibLogger.get('validation', 'KeyValidator');

/**
 * Validates that the location key array in a ComKey matches the expected hierarchy
 * defined by the coordinate's key type array (kta).
 *
 * @param key - The composite key to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @throws Error if location key array order is incorrect
 */
const validateLocationKeyOrder = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  const keyTypeArray = coordinate.kta;
  const expectedLocationTypes = keyTypeArray.slice(1); // Remove primary key type
  const actualLocationTypes = key.loc.map(loc => loc.kt);
  
  // Check if lengths match
  if (expectedLocationTypes.length !== actualLocationTypes.length) {
    logger.error('Location key array length mismatch', {
      expected: expectedLocationTypes.length,
      actual: actualLocationTypes.length,
      key,
      coordinate,
      operation
    });
    
    // Build detailed error message
    const expectedOrder = expectedLocationTypes.map((kt, i) =>
      `  [${i}] { kt: '${kt}', lk: <value> }`
    ).join('\n');
    
    const actualOrder = key.loc.map((loc, i) =>
      `  [${i}] { kt: '${loc.kt}', lk: ${JSON.stringify(loc.lk)} }`
    ).join('\n');
    
    throw new Error(
      `Location key array length mismatch for ${operation} operation.\n` +
      `\n` +
      `Expected ${expectedLocationTypes.length} location keys but received ${actualLocationTypes.length}.\n` +
      `\n` +
      `Expected location key order for '${keyTypeArray[0]}':\n` +
      `${expectedOrder}\n` +
      `\n` +
      `Received location key order:\n` +
      `${actualOrder}`
    );
  }
  
  // Check if each position matches
  for (let i = 0; i < expectedLocationTypes.length; i++) {
    if (expectedLocationTypes[i] !== actualLocationTypes[i]) {
      logger.error('Location key array order mismatch', {
        position: i,
        expected: expectedLocationTypes[i],
        actual: actualLocationTypes[i],
        key,
        coordinate,
        operation
      });
      
      // Build detailed error message
      const expectedOrder = expectedLocationTypes.map((kt, i) =>
        `  [${i}] { kt: '${kt}', lk: <value> }`
      ).join('\n');
      
      const actualOrder = key.loc.map((loc, i) =>
        `  [${i}] { kt: '${loc.kt}', lk: ${JSON.stringify(loc.lk)} }`
      ).join('\n');
      
      throw new Error(
        `Location key array order mismatch for ${operation} operation.\n` +
        `\n` +
        `At position ${i}, expected key type "${expectedLocationTypes[i]}" but received "${actualLocationTypes[i]}".\n` +
        `\n` +
        `Expected location key order for '${keyTypeArray[0]}':\n` +
        `${expectedOrder}\n` +
        `\n` +
        `Received location key order:\n` +
        `${actualOrder}\n` +
        `\n` +
        `Tip: Location keys must be ordered according to the hierarchy: [${expectedLocationTypes.join(', ')}]`
      );
    }
  }
};

/**
 * Validates that a key is valid and matches the expected library type.
 *
 * This function performs comprehensive validation:
 * 1. Validates key type (PriKey vs ComKey) matches library type (primary vs composite)
 * 2. For composite keys, validates location key array order matches hierarchy
 * 3. Validates key structure is correct
 *
 * @param key - The key to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @throws Error if key type doesn't match library type or location key array order is incorrect
 *
 * @example
 * ```typescript
 * // Validate a PriKey for a primary library
 * validateKey(
 *   { kt: 'product', pk: '123' },
 *   coordinate,
 *   'get'
 * );
 *
 * // Validate a ComKey for a composite library
 * validateKey(
 *   { kt: 'product', pk: '123', loc: [{ kt: 'store', lk: '456' }] },
 *   coordinate,
 *   'get'
 * );
 * ```
 */
export const validateKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  logger.debug(`Validating key for ${operation}`, { key, coordinate: coordinate.kta });
  
  // Check for null/undefined early
  if (!key || key === null) {
    throw new Error(
      `Invalid key structure for ${operation} operation.\n` +
      `\n` +
      `The provided key is null or undefined.\n` +
      `\n` +
      `Valid key formats:\n` +
      `  PriKey: { kt: string, pk: string|number }\n` +
      `  ComKey: { kt: string, pk: string|number, loc: Array<{ kt: string, lk: string|number }> }`
    );
  }
  
  // Runtime validation: Check if the key type matches the library type
  const isCompositeLibrary = coordinate.kta.length > 1;
  const keyIsComposite = isComKey(key);
  const keyIsPrimary = isPriKey(key);
  
  // Validate that the key type matches the library type
  if (isCompositeLibrary && !keyIsComposite) {
    // This is a composite library but received a primary key
    logger.error(`Composite library received primary key in ${operation}`, { key, coordinate });
    
    const keyTypeArray = coordinate.kta;
    
    throw new Error(
      `Invalid key type for ${operation} operation.\n` +
      `\n` +
      `This is a composite item library. You must provide a ComKey with location keys.\n` +
      `\n` +
      `Expected: ComKey with format:\n` +
      `  {\n` +
      `    kt: '${keyTypeArray[0]}',\n` +
      `    pk: string|number,\n` +
      `    loc: [\n` +
      keyTypeArray.slice(1).map(kt => `      { kt: '${kt}', lk: string|number }`).join(',\n') + '\n' +
      `    ]\n` +
      `  }\n` +
      `\n` +
      `Received: PriKey with format:\n` +
      `  ${JSON.stringify(key, null, 2)}\n` +
      `\n` +
      `Example correct usage:\n` +
      `  library.operations.${operation}({\n` +
      `    kt: '${keyTypeArray[0]}',\n` +
      `    pk: 'item-id',\n` +
      `    loc: [${keyTypeArray.slice(1).map(kt => `{ kt: '${kt}', lk: 'parent-id' }`).join(', ')}]\n` +
      `  })`
    );
  }
  
  if (!isCompositeLibrary && keyIsComposite) {
    // This is a primary library but received a composite key
    logger.error(`Primary library received composite key in ${operation}`, { key, coordinate });
    
    const keyTypeArray = coordinate.kta;
    
    throw new Error(
      `Invalid key type for ${operation} operation.\n` +
      `\n` +
      `This is a primary item library. You should provide a PriKey without location keys.\n` +
      `\n` +
      `Expected: PriKey with format:\n` +
      `  { kt: '${keyTypeArray[0]}', pk: string|number }\n` +
      `\n` +
      `Received: ComKey with format:\n` +
      `  ${JSON.stringify(key, null, 2)}\n` +
      `\n` +
      `Example correct usage:\n` +
      `  library.operations.${operation}({ kt: '${keyTypeArray[0]}', pk: 'item-id' })`
    );
  }
  
  if (!keyIsPrimary && !keyIsComposite) {
    // Invalid key structure
    logger.error(`Invalid key structure in ${operation}`, { key, coordinate });
    
    throw new Error(
      `Invalid key structure for ${operation} operation.\n` +
      `\n` +
      `The provided key does not match PriKey or ComKey format.\n` +
      `\n` +
      `Received:\n` +
      `  ${JSON.stringify(key, null, 2)}\n` +
      `\n` +
      `Valid key formats:\n` +
      `  PriKey: { kt: string, pk: string|number }\n` +
      `  ComKey: { kt: string, pk: string|number, loc: Array<{ kt: string, lk: string|number }> }`
    );
  }
  
  // Validate that the key's kt field matches the expected primary key type
  const expectedKeyType = coordinate.kta[0];
  if ((key as any).kt !== expectedKeyType) {
    logger.error(`Key type mismatch in ${operation}`, {
      expected: expectedKeyType,
      received: (key as any).kt,
      key,
      coordinate
    });
    
    throw new Error(
      `Invalid key type for ${operation} operation.\n` +
      `\n` +
      `Expected key type: '${expectedKeyType}'\n` +
      `Received key type: '${(key as any).kt}'\n` +
      `\n` +
      `Example correct usage:\n` +
      `  library.operations.${operation}({ kt: '${expectedKeyType}', pk: 'item-id', ... })`
    );
  }
  
  // For composite keys, validate the location key array order
  if (keyIsComposite) {
    const comKey = key as ComKey<S, L1, L2, L3, L4, L5>;
    
    // Empty loc array is a special case: it means "find by primary key across all locations"
    // This is used for foreign key references to composite items where the location context is unknown
    if (comKey.loc.length === 0) {
      logger.debug(`Empty loc array detected in ${operation} - will search across all locations`, { key });
    } else {
      // For non-empty loc arrays, validate the order matches the expected hierarchy
      validateLocationKeyOrder(comKey, coordinate, operation);
    }
  }
  
  logger.debug(`Key validation passed for ${operation}`, { key });
};

/**
 * Validates a PriKey structure
 *
 * @param key - The primary key to validate
 * @param expectedType - The expected key type
 * @param operation - The operation name (for error messages)
 * @throws Error if key is invalid
 */
export const validatePriKey = <S extends string>(
  key: PriKey<S>,
  expectedType: S,
  operation: string
): void => {
  if (!key || key === null) {
    throw new Error(`[${operation}] PriKey is undefined or null`);
  }
  
  if (!key.kt) {
    throw new Error(`[${operation}] PriKey is missing 'kt' field`);
  }
  
  if (key.kt !== expectedType) {
    throw new Error(
      `[${operation}] PriKey has incorrect type.\n` +
      `Expected: '${expectedType}'\n` +
      `Received: '${key.kt}'`
    );
  }
  
  if (typeof key.pk === 'undefined' || key.pk === null) {
    throw new Error(`[${operation}] PriKey is missing 'pk' field`);
  }
};

/**
 * Validates a ComKey structure
 *
 * @param key - The composite key to validate
 * @param coordinate - The coordinate defining the expected hierarchy
 * @param operation - The operation name (for error messages)
 * @throws Error if key is invalid
 */
export const validateComKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  if (!key || key === null) {
    throw new Error(`[${operation}] ComKey is undefined or null`);
  }
  
  if (!key.kt) {
    throw new Error(`[${operation}] ComKey is missing 'kt' field`);
  }
  
  if (key.kt !== coordinate.kta[0]) {
    throw new Error(
      `[${operation}] ComKey has incorrect type.\n` +
      `Expected: '${coordinate.kta[0]}'\n` +
      `Received: '${key.kt}'`
    );
  }
  
  if (typeof key.pk === 'undefined' || key.pk === null) {
    throw new Error(`[${operation}] ComKey is missing 'pk' field`);
  }
  
  if (!Array.isArray(key.loc)) {
    throw new Error(`[${operation}] ComKey is missing or invalid 'loc' field (must be an array)`);
  }
  
  // Validate location key order if loc is not empty
  if (key.loc.length > 0) {
    validateLocationKeyOrder(key, coordinate, operation);
  }
};


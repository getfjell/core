/**
 * Location array validation
 *
 * Validates that LocKeyArray parameters match the expected Coordinate hierarchy.
 */

import type { LocKey, LocKeyArray } from "../keys";
import type { Coordinate } from "../Coordinate";
import LibLogger from "../logger";
import type { ValidationResult } from "./types";

const logger = LibLogger.get('validation', 'LocationValidator');

/**
 * Validates that a standalone LocKeyArray parameter matches the expected hierarchy
 * defined by the coordinate's key type array (kta).
 *
 * This is used to validate the `locations` parameter passed to operations like
 * all(), find(), create(), etc.
 *
 * @param locations - The location key array to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @throws Error if location key array order is incorrect
 *
 * @example
 * ```typescript
 * validateLocations(
 *   [{kt: 'store', lk: '123'}],
 *   coordinate,
 *   'find'
 * );
 * ```
 */
export const validateLocations = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [] | undefined,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  // Skip validation if locations is empty or undefined
  if (!locations || locations.length === 0) {
    return;
  }
  
  const keyTypeArray = coordinate.kta;
  const expectedLocationTypes = keyTypeArray.slice(1); // Remove primary key type
  const actualLocationTypes = (locations as Array<LocKey<L1 | L2 | L3 | L4 | L5>>).map(loc => loc.kt);
  
  logger.debug(`Validating locations for ${operation}`, {
    expected: expectedLocationTypes,
    actual: actualLocationTypes,
    coordinate: keyTypeArray
  });
  
  // Check if lengths match
  if (actualLocationTypes.length > expectedLocationTypes.length) {
    logger.error('Location key array has too many elements', {
      expected: expectedLocationTypes.length,
      actual: actualLocationTypes.length,
      expectedTypes: expectedLocationTypes,
      actualTypes: actualLocationTypes,
      coordinate,
      operation
    });
    throw new Error(
      `Invalid location key array for ${operation}: ` +
      `Expected at most ${expectedLocationTypes.length} location keys ` +
      `(hierarchy: [${expectedLocationTypes.join(', ')}]), ` +
      `but received ${actualLocationTypes.length} ` +
      `(types: [${actualLocationTypes.join(', ')}])`
    );
  }
  
  // Check if each position matches the expected hierarchy
  for (let i = 0; i < actualLocationTypes.length; i++) {
    if (expectedLocationTypes[i] !== actualLocationTypes[i]) {
      logger.error('Location key array order mismatch', {
        position: i,
        expected: expectedLocationTypes[i],
        actual: actualLocationTypes[i],
        expectedHierarchy: expectedLocationTypes,
        actualOrder: actualLocationTypes,
        coordinate,
        operation
      });
      throw new Error(
        `Invalid location key array order for ${operation}: ` +
        `At position ${i}, expected key type "${expectedLocationTypes[i]}" ` +
        `but received "${actualLocationTypes[i]}". ` +
        `Location keys must be ordered according to the hierarchy: [${expectedLocationTypes.join(', ')}]. ` +
        `Received order: [${actualLocationTypes.join(', ')}]`
      );
    }
  }
  
  logger.debug(`Location key array validation passed for ${operation}`, { locations });
};

/**
 * Non-throwing version of validateLocations that returns a ValidationResult
 *
 * @param locations - The location key array to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @returns ValidationResult with valid flag and optional error message
 */
export const isValidLocations = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [] | undefined,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): ValidationResult => {
  try {
    validateLocations(locations, coordinate, operation);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};


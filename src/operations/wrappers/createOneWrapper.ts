/**
 * Wrapper for one() operation
 *
 * Provides automatic validation for one() operation parameters.
 */

import type { Item } from "../../items";
import type { ItemQuery } from "../../item/ItemQuery";
import type { LocKeyArray } from "../../keys";
import type { Coordinate } from "../../Coordinate";
import { validateLocations, validatePK, validateQuery } from "../../validation";
import type { OneMethod } from "../methods";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'one');

/**
 * Creates a wrapped one() method with automatic parameter validation.
 *
 * The wrapper handles:
 * - Query validation
 * - Location array validation against coordinate
 * - Parameter normalization (undefined → defaults)
 * - Consistent error handling
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation (no validation needed)
 * @param options - Optional configuration
 * @returns A fully validated one() method
 *
 * @example
 * ```typescript
 * const one = createOneWrapper(
 *   coordinate,
 *   async (query, locations) => {
 *     // Just implement the logic - validation is automatic
 *     return await database.findOne(query, locations);
 *   }
 * );
 *
 * // Usage
 * const item = await one({ status: 'active' }, [{ kt: 'org', lk: '123' }]);
 * ```
 */
export function createOneWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: OneMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): OneMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'one';
  
  return async (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null> => {
    
    // Debug logging if enabled
    if (options.debug) {
      logger.debug(`[${operationName}] Called with:`, { query, locations });
    }
    
    // 1. Validate parameters (unless explicitly skipped)
    if (!options.skipValidation) {
      try {
        validateQuery(query, operationName);
        validateLocations(locations, coordinate, operationName);
      } catch (error) {
        // Validation errors are already well-formatted
        throw error;
      }
    }
    
    // 2. Normalize parameters
    const normalizedQuery = query ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // 3. Call implementation with validated params
    try {
      const result = await implementation(normalizedQuery, normalizedLocations);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Result:`, result ? 'found' : 'not found');
      }
      
      // Validate primary key type if result exists
      if (result && !options.skipValidation) {
        return validatePK(result, coordinate.kta[0]) as V;
      }
      
      return result;
      
    } catch (error) {
      // 4. Handle errors
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [query, locations],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      // Default error enhancement
      const enhanced = new Error(
        `[${operationName}] Operation failed: ${(error as Error).message}`,
        { cause: error }
      );
      
      // Preserve stack trace
      if ((error as Error).stack) {
        enhanced.stack = (error as Error).stack;
      }
      
      throw enhanced;
    }
  };
}


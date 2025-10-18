/**
 * Wrapper for all() operation
 *
 * Provides automatic validation for all() operation parameters.
 */

import type { Item } from "../../items";
import type { ItemQuery } from "../../item/ItemQuery";
import type { LocKeyArray } from "../../keys";
import type { Coordinate } from "../../Coordinate";
import { validateLocations, validatePK, validateQuery } from "../../validation";
import type { AllMethod } from "../methods";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'all');

/**
 * Creates a wrapped all() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated all() method
 *
 * @example
 * ```typescript
 * const all = createAllWrapper(
 *   coordinate,
 *   async (query, locations) => {
 *     return await database.findAll(query, locations);
 *   }
 * );
 * ```
 */
export function createAllWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: AllMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): AllMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'all';
  
  return async (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called with:`, { query, locations });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateQuery(query, operationName);
      validateLocations(locations, coordinate, operationName);
    }
    
    // Normalize
    const normalizedQuery = query ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // Execute
    try {
      const result = await implementation(normalizedQuery, normalizedLocations);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Result: ${result.length} items`);
      }
      
      // Validate primary key types for all items
      if (!options.skipValidation) {
        return validatePK(result, coordinate.kta[0]) as V[];
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [query, locations],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      throw new Error(
        `[${operationName}] Operation failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


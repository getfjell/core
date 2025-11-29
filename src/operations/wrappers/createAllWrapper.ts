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
import type { AllOperationResult, AllOptions } from "../Operations";
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
 *   async (query, locations, options) => {
 *     return await database.findAll(query, locations, options);
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
  wrapperOptions: WrapperOptions = {}
): AllMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = wrapperOptions.operationName || 'all';
  
  return async (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    allOptions?: AllOptions
  ): Promise<AllOperationResult<V>> => {
    
    if (wrapperOptions.debug) {
      logger.debug(`[${operationName}] Called with:`, { query, locations, allOptions });
    }
    
    // Validate query and locations
    if (!wrapperOptions.skipValidation) {
      validateQuery(query, operationName);
      validateLocations(locations, coordinate, operationName);
      
      // Validate pagination options
      if (allOptions && 'limit' in allOptions && allOptions.limit != null) {
        if (!Number.isInteger(allOptions.limit) || allOptions.limit < 1) {
          throw new Error(`[${operationName}] limit must be a positive integer, got: ${allOptions.limit}`);
        }
      }
      if (allOptions && 'offset' in allOptions && allOptions.offset != null) {
        if (!Number.isInteger(allOptions.offset) || allOptions.offset < 0) {
          throw new Error(`[${operationName}] offset must be a non-negative integer, got: ${allOptions.offset}`);
        }
      }
    }
    
    // Normalize
    const normalizedQuery = query ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // Execute
    try {
      const result = await implementation(normalizedQuery, normalizedLocations, allOptions);
      
      if (wrapperOptions.debug) {
        logger.debug(`[${operationName}] Result: ${result.items.length} items, total: ${result.metadata.total}`);
      }
      
      // Validate primary key types for all items
      if (!wrapperOptions.skipValidation) {
        const validatedItems = validatePK(result.items, coordinate.kta[0]) as V[];
        return {
          items: validatedItems,
          metadata: result.metadata
        };
      }
      
      return result;
      
    } catch (error) {
      if (wrapperOptions.onError) {
        const context: ErrorContext = {
          operationName,
          params: [query, locations, allOptions],
          coordinate
        };
        throw wrapperOptions.onError(error as Error, context);
      }
      
      throw new Error(
        `[${operationName}] Operation failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


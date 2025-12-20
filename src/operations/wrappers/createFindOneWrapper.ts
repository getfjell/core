/**
 * Wrapper for findOne() operation
 *
 * Provides automatic validation for findOne() operation parameters.
 */

import { Coordinate, FindOneMethod, Item, LocKeyArray, OperationParams } from "@fjell/types";
import { validateFinderName, validateLocations, validateOperationParams, validatePK } from "../../validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'findOne');

/**
 * Creates a wrapped findOne() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated findOne() method
 *
 * @example
 * ```typescript
 * const findOne = createFindOneWrapper(
 *   coordinate,
 *   async (finder, params, locations) => {
 *     return await database.executeFinderOne(finder, params, locations);
 *   }
 * );
 * ```
 */
export function createFindOneWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: FindOneMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): FindOneMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'findOne';
  
  return async (
    finder: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { finder, params, locations });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateFinderName(finder, operationName);
      validateOperationParams(params, operationName);
      validateLocations(locations, coordinate, operationName);
    }
    
    // Normalize
    const normalizedParams = params ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // Execute
    try {
      const result = await implementation(finder, normalizedParams, normalizedLocations);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Result for finder "${finder}":`, result ? 'found' : 'not found');
      }
      
      // Validate primary key type if result exists
      if (result && !options.skipValidation) {
        return validatePK(result, coordinate.kta[0]) as V;
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [finder, params, locations],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      throw new Error(
        `[${operationName}] Operation failed for finder "${finder}": ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


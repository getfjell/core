/**
 * Wrapper for get() operation
 *
 * Provides automatic validation for get() operation parameters.
 */

import type { Item } from "../../items";
import type { ComKey, PriKey } from "../../keys";
import type { Coordinate } from "../../Coordinate";
import { validateKey, validatePK } from "../../validation";
import type { GetMethod } from "../methods";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'get');

/**
 * Creates a wrapped get() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated get() method
 *
 * @example
 * ```typescript
 * const get = createGetWrapper(
 *   coordinate,
 *   async (key) => {
 *     return await database.findByKey(key);
 *   }
 * );
 * ```
 */
export function createGetWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: GetMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): GetMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'get';
  
  return async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | null> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called with key:`, key);
    }
    
    // Validate key structure
    if (!options.skipValidation) {
      validateKey(key, coordinate, operationName);
    }
    
    // Execute
    try {
      const result = await implementation(key);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Result:`, result ? 'found' : 'not found');
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
          params: [key],
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


/**
 * Wrapper for update() operation
 *
 * Provides automatic validation for update() operation parameters.
 */

import type { Item } from "../../items";
import type { ComKey, PriKey } from "../../keys";
import type { Coordinate } from "../../Coordinate";
import { validateKey, validatePK } from "../../validation";
import type { UpdateMethod } from "../methods";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'update');

/**
 * Creates a wrapped update() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated update() method
 *
 * @example
 * ```typescript
 * const update = createUpdateWrapper(
 *   coordinate,
 *   async (key, item) => {
 *     return await database.update(key, item);
 *   }
 * );
 * ```
 */
export function createUpdateWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: UpdateMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): UpdateMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'update';
  
  return async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    updateOptions?: import('../Operations').UpdateOptions
  ): Promise<V> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called with:`, { key, item, updateOptions });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateKey(key, coordinate, operationName);
      
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error(
          `[${operationName}] Invalid item parameter.\n` +
          `\n` +
          `Expected: object\n` +
          `Received: ${Array.isArray(item) ? 'array' : typeof item}`
        );
      }
    }
    
    // Execute
    try {
      const result = await implementation(key, item, updateOptions);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Updated item:`, result.key);
      }
      
      // Validate primary key type
      if (!options.skipValidation) {
        return validatePK(result, coordinate.kta[0]) as V;
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [key, item, updateOptions],
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


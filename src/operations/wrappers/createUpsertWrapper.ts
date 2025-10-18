/**
 * Wrapper for upsert() operation
 *
 * Provides automatic validation for upsert() operation parameters.
 */

import type { Item } from "../../items";
import type { ComKey, LocKeyArray, PriKey } from "../../keys";
import type { Coordinate } from "../../Coordinate";
import { validateKey, validateLocations, validatePK } from "../../validation";
import type { UpsertMethod } from "../methods";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'upsert');

/**
 * Creates a wrapped upsert() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated upsert() method
 *
 * @example
 * ```typescript
 * const upsert = createUpsertWrapper(
 *   coordinate,
 *   async (key, item, locations) => {
 *     return await database.upsert(key, item, locations);
 *   }
 * );
 * ```
 */
export function createUpsertWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: UpsertMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): UpsertMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'upsert';
  
  return async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5>
  ): Promise<V> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called with:`, { key, item, locations });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateKey(key, coordinate, operationName);
      validateLocations(locations, coordinate, operationName);
      
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
      const result = await implementation(key, item);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Upserted item:`, result.key);
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
          params: [key, item, locations],
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


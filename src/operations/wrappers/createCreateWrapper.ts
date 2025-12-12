/**
 * Wrapper for create() operation
 *
 * Provides automatic validation for create() operation parameters.
 */

import type { Item } from "../../items";
import type { Coordinate } from "../../Coordinate";
import { validateKey, validateLocations, validatePK } from "../../validation";
import type { CreateMethod } from "../methods";
import type { CreateOptions } from "../Operations";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'create');

/**
 * Creates a wrapped create() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional wrapper configuration
 * @returns A fully validated create() method
 *
 * @example
 * ```typescript
 * const create = createCreateWrapper(
 *   coordinate,
 *   async (item, options) => {
 *     return await database.create(item, options);
 *   }
 * );
 * ```
 */
export function createCreateWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: CreateMethod<V, S, L1, L2, L3, L4, L5>,
  wrapperOptions: WrapperOptions = {}
): CreateMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = wrapperOptions.operationName || 'create';
  
  return async (
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    createOptions?: CreateOptions<S, L1, L2, L3, L4, L5>
  ): Promise<V> => {
    
    if (wrapperOptions.debug) {
      logger.debug(`[${operationName}] Called with:`, { item, options: createOptions });
    }
    
    // Validate
    if (!wrapperOptions.skipValidation) {
      // Validate item is an object
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error(
          `[${operationName}] Invalid item parameter.\n` +
          `\n` +
          `Expected: object\n` +
          `Received: ${Array.isArray(item) ? 'array' : typeof item}`
        );
      }
      
      // Validate create options
      if (createOptions) {
        if ('key' in createOptions) {
          // Validate the key (even if null, let validateKey handle it)
          validateKey(createOptions.key as any, coordinate, operationName);
        }
        if ('locations' in createOptions) {
          // Validate the locations (even if undefined, let validateLocations handle it)
          validateLocations(createOptions.locations, coordinate, operationName);
        }
      }
    }
    
    // Execute
    try {
      const result = await implementation(item, createOptions);
      
      if (wrapperOptions.debug) {
        logger.debug(`[${operationName}] Created item:`, result.key);
      }
      
      // Validate primary key type
      if (!wrapperOptions.skipValidation) {
        return validatePK(result, coordinate.kta[0]) as V;
      }
      
      return result;
      
    } catch (error) {
      if (wrapperOptions.onError) {
        const context: ErrorContext = {
          operationName,
          params: [item, createOptions],
          coordinate
        };
        throw wrapperOptions.onError(error as Error, context);
      }
      
      logger.error(`[${operationName}] Operation failed in wrapper`, {
        component: 'core',
        wrapper: 'createCreateWrapper',
        operation: operationName,
        itemType: coordinate.kta[0],
        hasKey: createOptions && 'key' in createOptions,
        hasLocations: createOptions && 'locations' in createOptions,
        errorType: (error as Error).constructor?.name,
        errorMessage: (error as Error).message,
        suggestion: 'Check validation rules, required fields, unique constraints, and database connectivity',
        coordinate: JSON.stringify(coordinate)
      });
      
      throw new Error(
        `[${operationName}] Operation failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


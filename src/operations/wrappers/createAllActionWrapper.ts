/**
 * Wrapper for allAction() operation
 *
 * Provides automatic validation for allAction() operation parameters.
 */

import { AffectedKeys, AllActionOperationMethod, Coordinate, Item, LocKeyArray, OperationParams } from "@fjell/types";
import { validateActionName, validateLocations, validateOperationParams, validatePK } from "@fjell/validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'allAction');

/**
 * Creates a wrapped allAction() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated allAction() method
 *
 * @example
 * ```typescript
 * const allAction = createAllActionWrapper(
 *   coordinate,
 *   async (action, params, locations) => {
 *     return await database.executeAllAction(action, params, locations);
 *   }
 * );
 * ```
 */
export function createAllActionWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: AllActionOperationMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): AllActionOperationMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'allAction';
  
  return async (
    action: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], AffectedKeys]> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { action, params, locations });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateActionName(action, operationName);
      validateOperationParams(params, operationName);
      validateLocations(locations, coordinate, operationName);
    }
    
    // Normalize
    const normalizedParams = params ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // Execute
    try {
      const result = await implementation(action, normalizedParams, normalizedLocations);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Action "${action}" completed:`, {
          itemsAffected: result[0].length,
          affectedKeys: result[1].length
        });
      }
      
      // Validate primary key types for all returned items
      if (!options.skipValidation) {
        const validatedItems = validatePK(result[0], coordinate.kta[0]) as V[];
        return [validatedItems, result[1]];
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [action, params, locations],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      throw new Error(
        `[${operationName}] Action "${action}" failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


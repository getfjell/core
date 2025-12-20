/**
 * Wrapper for action() operation
 *
 * Provides automatic validation for action() operation parameters.
 */

import { ActionOperationMethod, AffectedKeys, ComKey, Coordinate, Item, OperationParams, PriKey } from "@fjell/types";
import { validateActionName, validateKey, validateOperationParams, validatePK } from "@fjell/validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'action');

/**
 * Creates a wrapped action() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated action() method
 *
 * @example
 * ```typescript
 * const action = createActionWrapper(
 *   coordinate,
 *   async (key, action, params) => {
 *     return await database.executeAction(key, action, params);
 *   }
 * );
 * ```
 */
export function createActionWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: ActionOperationMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): ActionOperationMethod<V, S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'action';
  
  return async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    action: string,
    params?: OperationParams
  ): Promise<[V, AffectedKeys]> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { key, action, params });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateKey(key, coordinate, operationName);
      validateActionName(action, operationName);
      validateOperationParams(params, operationName);
    }
    
    // Normalize
    const normalizedParams = params ?? {};
    
    // Execute
    try {
      const result = await implementation(key, action, normalizedParams);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Action "${action}" completed:`, {
          itemKey: result[0].key,
          affectedKeys: result[1].length
        });
      }
      
      // Validate primary key type of the returned item
      if (!options.skipValidation) {
        const validatedItem = validatePK(result[0], coordinate.kta[0]) as V;
        return [validatedItem, result[1]];
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [key, action, params],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      logger.error(`[${operationName}] Action failed in wrapper`, {
        component: 'core',
        wrapper: 'createActionWrapper',
        operation: operationName,
        action,
        key: JSON.stringify(key),
        params: JSON.stringify(params),
        itemType: coordinate.kta[0],
        errorType: (error as Error).constructor?.name,
        errorMessage: (error as Error).message,
        suggestion: 'Check action name is valid, item exists, and action implementation',
        coordinate: JSON.stringify(coordinate)
      });
      
      throw new Error(
        `[${operationName}] Action "${action}" failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


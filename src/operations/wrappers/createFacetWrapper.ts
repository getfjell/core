/**
 * Wrapper for facet() operation
 *
 * Provides automatic validation for facet() operation parameters.
 */

import { ComKey, Coordinate, FacetOperationMethod, OperationParams, PriKey } from "@fjell/types";
import { validateFacetName, validateKey, validateOperationParams } from "@fjell/validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'facet');

/**
 * Creates a wrapped facet() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated facet() method
 *
 * @example
 * ```typescript
 * const facet = createFacetWrapper(
 *   coordinate,
 *   async (key, facet, params) => {
 *     return await database.executeFacet(key, facet, params);
 *   }
 * );
 * ```
 */
export function createFacetWrapper<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: FacetOperationMethod<S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): FacetOperationMethod<S, L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'facet';
  
  return async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    facet: string,
    params?: OperationParams
  ): Promise<any> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { key, facet, params });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateKey(key, coordinate, operationName);
      validateFacetName(facet, operationName);
      validateOperationParams(params, operationName);
    }
    
    // Normalize
    const normalizedParams = params ?? {};
    
    // Execute
    try {
      const result = await implementation(key, facet, normalizedParams);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Facet "${facet}" completed`);
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [key, facet, params],
          coordinate
        };
        throw options.onError(error as Error, context);
      }
      
      throw new Error(
        `[${operationName}] Facet "${facet}" failed: ${(error as Error).message}`,
        { cause: error }
      );
    }
  };
}


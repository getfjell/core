/**
 * Wrapper for allFacet() operation
 *
 * Provides automatic validation for allFacet() operation parameters.
 */

import { AllFacetOperationMethod, Coordinate, LocKeyArray, OperationParams } from "@fjell/types";
import { validateFacetName, validateLocations, validateOperationParams } from "../../validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'allFacet');

/**
 * Creates a wrapped allFacet() method with automatic parameter validation.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated allFacet() method
 *
 * @example
 * ```typescript
 * const allFacet = createAllFacetWrapper(
 *   coordinate,
 *   async (facet, params, locations) => {
 *     return await database.executeAllFacet(facet, params, locations);
 *   }
 * );
 * ```
 */
export function createAllFacetWrapper<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: AllFacetOperationMethod<L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): AllFacetOperationMethod<L1, L2, L3, L4, L5> {
  
  const operationName = options.operationName || 'allFacet';
  
  return async (
    facet: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any> => {
    
    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { facet, params, locations });
    }
    
    // Validate
    if (!options.skipValidation) {
      validateFacetName(facet, operationName);
      validateOperationParams(params, operationName);
      validateLocations(locations, coordinate, operationName);
    }
    
    // Normalize
    const normalizedParams = params ?? {};
    const normalizedLocations = (locations ?? []) as LocKeyArray<L1, L2, L3, L4, L5> | [];
    
    // Execute
    try {
      const result = await implementation(facet, normalizedParams, normalizedLocations);
      
      if (options.debug) {
        logger.debug(`[${operationName}] Facet "${facet}" completed`);
      }
      
      return result;
      
    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [facet, params, locations],
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


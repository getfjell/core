/**
 * Wrapper for find() operation
 *
 * Provides automatic validation for find() operation parameters and supports
 * hybrid pagination approach:
 * - If finder returns FindOperationResult<V>, uses it directly (opt-in)
 * - If finder returns V[], applies post-processing pagination
 */

import { Coordinate, FindMethod, FindOperationResult, FindOptions, Item, LocKeyArray, OperationParams, PaginationOptions } from "@fjell/types";
import { validateFinderName, validateLocations, validateOperationParams, validatePK } from "../../validation";
import type { ErrorContext, WrapperOptions } from "./types";
import LibLogger from "../../logger";

const logger = LibLogger.get('operations', 'wrappers', 'find');

/**
 * Helper function to check if a value is a FindOperationResult (or OperationResult)
 */
function isFindOperationResult<T>(value: any): value is FindOperationResult<T> {
  return (
    value &&
    typeof value === 'object' &&
    'items' in value &&
    'metadata' in value &&
    Array.isArray(value.items) &&
    value.metadata &&
    typeof value.metadata === 'object' &&
    'total' in value.metadata
  );
}

/**
 * Helper function to apply post-processing pagination to an array
 */
function applyPagination<T>(
  items: T[],
  options?: PaginationOptions
): FindOperationResult<T> {
  const total = items.length;
  const offset = options?.offset ?? 0;
  const limit = options?.limit;

  let paginatedItems = items;

  // Apply offset
  if (offset > 0) {
    paginatedItems = paginatedItems.slice(offset);
  }

  // Apply limit
  if (limit != null && limit >= 0) {
    paginatedItems = paginatedItems.slice(0, limit);
  }

  const returned = paginatedItems.length;
  const hasMore = limit != null && (offset + returned < total);

  return {
    items: paginatedItems,
    metadata: {
      total,
      returned,
      offset,
      limit,
      hasMore
    }
  };
}

/**
 * Creates a wrapped find() method with automatic parameter validation and hybrid pagination support.
 *
 * @param coordinate - The coordinate defining the item hierarchy
 * @param implementation - The core logic for the operation
 * @param options - Optional configuration
 * @returns A fully validated find() method that returns FindOperationResult<V>
 *
 * @example
 * ```typescript
 * const find = createFindWrapper(
 *   coordinate,
 *   async (finder, params, locations, findOptions) => {
 *     const finderMethod = finders[finder];
 *     const result = await finderMethod(params, locations, findOptions);
 *     // Framework handles hybrid detection and post-processing if needed
 *     return result;
 *   }
 * );
 * ```
 */
export function createFindWrapper<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  implementation: FindMethod<V, S, L1, L2, L3, L4, L5>,
  options: WrapperOptions = {}
): FindMethod<V, S, L1, L2, L3, L4, L5> {

  const operationName = options.operationName || 'find';

  return async (
    finder: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    findOptions?: FindOptions
  ): Promise<FindOperationResult<V>> => {

    if (options.debug) {
      logger.debug(`[${operationName}] Called:`, { finder, params, locations, findOptions });
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
      const result = await implementation(finder, normalizedParams, normalizedLocations, findOptions);

      // Check if finder opted-in (returned FindOperationResult) or legacy (returned V[])
      if (isFindOperationResult<V>(result)) {
        // Finder opted-in: validate and return as-is
        if (options.debug) {
          logger.debug(`[${operationName}] Finder "${finder}" opted-in to pagination, found ${result.items.length} items (total: ${result.metadata.total})`);
        }

        // Validate primary key types for all items
        if (!options.skipValidation) {
          const validatedItems = validatePK(result.items, coordinate.kta[0]) as V[];
          return {
            items: validatedItems,
            metadata: result.metadata
          };
        }

        return result;
      } else {
        // Legacy finder: apply post-processing pagination
        if (options.debug) {
          logger.debug(`[${operationName}] Finder "${finder}" using legacy signature, applying post-processing pagination`);
        }

        // Validate primary key types for all items
        let validatedItems: V[];
        if (!options.skipValidation) {
          validatedItems = validatePK(result, coordinate.kta[0]) as V[];
        } else {
          validatedItems = result as V[];
        }

        // Apply pagination post-processing
        return applyPagination(validatedItems, findOptions);
      }

    } catch (error) {
      if (options.onError) {
        const context: ErrorContext = {
          operationName,
          params: [finder, params, locations, findOptions],
          coordinate
        };
        throw options.onError(error as Error, context);
      }

      // Enhanced error message for finder operations
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : null;
      const errorCause = error instanceof Error && 'cause' in error ? error.cause : null;

      logger.error(`[${operationName}] Operation failed for finder "${finder}"`, {
        finder,
        params,
        locations,
        findOptions,
        errorMessage,
        errorStack,
        errorCause
      });

      throw new Error(
        `[${operationName}] Operation failed for finder "${finder}": ${errorMessage}`,
        { cause: error }
      );
    }
  };
}


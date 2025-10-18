/**
 * Operation wrapper functions that provide automatic parameter validation.
 *
 * These wrappers eliminate boilerplate validation code in Operations implementations.
 *
 * @example
 * ```typescript
 * import { createOneWrapper } from '@fjell/core';
 *
 * const one = createOneWrapper(
 *   coordinate,
 *   async (query, locations) => {
 *     // Validation happens automatically
 *     return await database.findOne(query, locations);
 *   }
 * );
 * ```
 *
 * @module wrappers
 */

// Types
export type { WrapperOptions, ErrorContext, WrapperContext } from './types';

// Wrapper functions
export { createOneWrapper } from './createOneWrapper';
export { createAllWrapper } from './createAllWrapper';
export { createGetWrapper } from './createGetWrapper';
export { createCreateWrapper } from './createCreateWrapper';
export { createUpdateWrapper } from './createUpdateWrapper';
export { createUpsertWrapper } from './createUpsertWrapper';
export { createRemoveWrapper } from './createRemoveWrapper';
export { createFindWrapper } from './createFindWrapper';
export { createFindOneWrapper } from './createFindOneWrapper';
export { createActionWrapper } from './createActionWrapper';
export { createAllActionWrapper } from './createAllActionWrapper';
export { createFacetWrapper } from './createFacetWrapper';
export { createAllFacetWrapper } from './createAllFacetWrapper';


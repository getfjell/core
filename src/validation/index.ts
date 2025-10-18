/**
 * Validation module
 *
 * Provides centralized validation functions for:
 * - Location arrays (LocKeyArray validation against Coordinate hierarchy)
 * - Keys (PriKey, ComKey validation)
 * - Items (Item key type validation)
 * - Queries (ItemQuery validation)
 * - Operation parameters (OperationParams validation)
 */

// Types
export type { ValidationOptions, ValidationResult } from './types';

// Location validation
export { validateLocations, isValidLocations } from './LocationValidator';

// Key validation
export { validateKey, validatePriKey, validateComKey } from './KeyValidator';

// Item validation
export { validatePK, validateKeys } from './ItemValidator';

// Query and parameter validation
export {
  validateQuery,
  validateOperationParams,
  validateFinderName,
  validateActionName,
  validateFacetName
} from './QueryValidator';


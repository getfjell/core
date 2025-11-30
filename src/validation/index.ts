/**
 * Validation module
 *
 * Provides centralized validation functions for:
 * - Location arrays (LocKeyArray validation against Coordinate hierarchy)
 * - Keys (PriKey, ComKey validation)
 * - Items (Item key type validation)
 * - Queries (ItemQuery validation)
 * - Operation parameters (OperationParams validation)
 * - Schema validation (Zod, Yup, etc.)
 */

// Types
export type { ValidationOptions, ValidationResult, SchemaValidator } from './types';

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

// Schema validation
export { validateSchema } from './schema';


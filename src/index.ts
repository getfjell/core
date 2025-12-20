// Framework Major Components
export { IQFactory } from './item/IQFactory';
export { IFactory } from './item/IFactory';
export { AItemService } from "./AItemService";
export { createCoordinate } from "./Coordinate";
export * from "./dictionary";

// Utilities and Implementations
export {
  isComKey,
  isPriKey,
  createNormalizedHashFunction,
  isPriKeyEqualNormalized,
  isLocKeyEqualNormalized,
  isComKeyEqualNormalized,
  isItemKeyEqualNormalized,
  isItemKeyEqual,
  isPriKeyEqual,
  isLocKeyEqual,
  isComKeyEqual,
  isItemKey,
  isLocKey,
  generateKeyArray,
  constructPriKey,
  cPK,
  toKeyTypeArray,
  extractKeyTypeArray,
  abbrevIK,
  abbrevLKA,
  primaryType,
  itemKeyToLocKeyArray,
  ikToLKA,
  locKeyArrayToItemKey,
  isValidPriKey,
  isValidLocKey,
  isValidLocKeyArray,
  isValidComKey,
  isValidItemKey,
  lkaToIK
} from './key/KUtils';

export {
  queryToParams,
  paramsToQuery,
  isQueryMatch,
  abbrevQuery,
  abbrevRef,
  abbrevAgg,
  abbrevCompoundCondition,
  abbrevCondition
} from './item/IQUtils';
export {
  isPriItem,
  isComItem
} from './item/IUtils';

// Error types and handling
export * from './errors';

// Operations Runtime (wrappers, etc.)
export * from './operations';

// Event system
export * from './event';

export * from "./dictionary";
export * from "./keys";
export * from "./items";
export * from "./Coordinate";
export * from "./Coordinate";
export { IFactory } from "./item/IFactory";
export { AItemService } from "./AItemService";

export * from './key/KUtils';

export * from './item/IFactory';
export * from './item/IQFactory';
export * from './item/IQUtils';
export * from './item/IUtils';
export * from './item/ItemQuery';

// Validation module
export * from './validation';

// Error types and handling
export * from './errors';
export * from './operations';

// Event system
export * from './event';

// Operations interfaces
export type {
  Operations,
  OperationParams,
  AffectedKeys,
  CreateOptions,
  UpdateOptions
} from './operations/Operations';
export {
  isPriKey as isOperationPriKey,
  isComKey as isOperationComKey
} from './operations/Operations';
export type {
  GetMethod,
  CreateMethod,
  UpdateMethod,
  RemoveMethod,
  UpsertMethod,
  AllMethod,
  OneMethod,
  FindMethod,
  FindOneMethod,
  FinderMethod,
  ActionMethod,
  ActionOperationMethod,
  AllActionMethod,
  AllActionOperationMethod,
  FacetMethod,
  FacetOperationMethod,
  AllFacetMethod,
  AllFacetOperationMethod,
  OperationsExtensions
} from './operations/methods';

// Operation wrappers - automatic validation for all operations
export * from './operations/wrappers';
// Core architectural patterns
export type { PrimaryOperations } from './operations/primary';
export type { ContainedOperations } from './operations/contained';

// UI usage patterns (React providers, etc.)
export type {
  CollectionOperations,
  InstanceOperations
} from './operations/specialized';

import { Item } from "../items";
import { ComKey, LocKeyArray, PriKey } from "../keys";
import { ItemQuery } from "../item/ItemQuery";
import { AffectedKeys, AllOperationResult, AllOptions, CreateOptions, OperationParams, UpdateOptions } from "./Operations";

/**
 * Get method signature - retrieves single item by key
 */
export interface GetMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | null>;
}

/**
 * Create method signature - creates new item
 */
export interface CreateMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: CreateOptions<S, L1, L2, L3, L4, L5>
  ): Promise<V>;
}

/**
 * Update method signature - updates existing item
 */
export interface UpdateMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: UpdateOptions
  ): Promise<V>;
}

/**
 * Remove method signature - removes item
 */
export interface RemoveMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | void>;
}

/**
 * Upsert method signature - updates or creates item
 */
export interface UpsertMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
    options?: UpdateOptions
  ): Promise<V>;
}

/**
 * All method signature - retrieves all items matching query with optional pagination.
 *
 * @param query - Optional query to filter items (may include limit/offset for backwards compatibility)
 * @param locations - Optional location hierarchy to scope the query
 * @param options - Optional pagination options (takes precedence over query limit/offset)
 * @returns Result containing items and pagination metadata
 *
 * @example Without options (backwards compatible)
 * ```typescript
 * const result = await operations.all({ compoundCondition: {...} });
 * // result.items = [...all matching items...]
 * // result.metadata.total = result.items.length
 * ```
 *
 * @example With options (new pattern)
 * ```typescript
 * const result = await operations.all(
 *   { compoundCondition: {...} },
 *   [],
 *   { limit: 50, offset: 0 }
 * );
 * // result.items = [...first 50 items...]
 * // result.metadata.total = total matching count
 * // result.metadata.hasMore = true if more items exist
 * ```
 */
export interface AllMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    options?: AllOptions
  ): Promise<AllOperationResult<V>>;
}

/**
 * One method signature - retrieves first item matching query
 */
export interface OneMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;
}

/**
 * Find method signature - finds multiple items using finder
 */
export interface FindMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    finder: string,
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;
}

/**
 * FindOne method signature - finds single item using finder
 */
export interface FindOneMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    finder: string,
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;
}

/**
 * Finder method signature - finds multiple items
 *
 * @example
 * ```typescript
 * const byEmailFinder: FinderMethod<User, 'user'> = async (params) => {
 *   return await database.findUsers({ email: params.email });
 * };
 * ```
 */
export interface FinderMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;
}

/**
 * Action operation method signature - executes action on specific item by key
 */
export interface ActionOperationMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    action: string,
    params?: OperationParams
  ): Promise<[V, AffectedKeys]>;
}

/**
 * Action method signature - user-defined action implementation
 */
export interface ActionMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    item: V,
    params: OperationParams
  ): Promise<[V, AffectedKeys]>;
}

/**
 * AllAction operation method signature - executes action on all items
 */
export interface AllActionOperationMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    action: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], AffectedKeys]>;
}

/**
 * All-action method signature - user-defined all-action implementation
 */
export interface AllActionMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], AffectedKeys]>;
}

/**
 * Facet operation method signature - executes facet on specific item by key
 */
export interface FacetOperationMethod<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    facet: string,
    params?: OperationParams
  ): Promise<any>;
}

/**
 * Facet method signature - user-defined facet implementation
 */
export interface FacetMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    item: V,
    params: OperationParams
  ): Promise<any>;
}

/**
 * AllFacet operation method signature - executes facet on all items
 */
export interface AllFacetOperationMethod<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    facet: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any>;
}

/**
 * All-facet method signature - user-defined all-facet implementation
 */
export interface AllFacetMethod<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  (
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any>;
}

/**
 * Extension maps for operations
 */
export interface OperationsExtensions<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  /** Registered finder methods */
  finders?: Record<string, FinderMethod<V, S, L1, L2, L3, L4, L5>>;
  
  /** Registered action methods */
  actions?: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>;
  
  /** Registered facet methods */
  facets?: Record<string, FacetMethod<V, S, L1, L2, L3, L4, L5>>;
  
  /** Registered all-action methods */
  allActions?: Record<string, AllActionMethod<V, S, L1, L2, L3, L4, L5>>;
  
  /** Registered all-facet methods */
  allFacets?: Record<string, AllFacetMethod<L1, L2, L3, L4, L5>>;
}


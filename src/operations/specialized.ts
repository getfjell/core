import { Item } from "../items";
import { ComKey, LocKeyArray, PriKey } from "../keys";
import { ItemQuery } from "../item/ItemQuery";
import { AffectedKeys, OperationParams, Operations } from "./Operations";

/**
 * Operations interface for Primary Items (no location hierarchy).
 * Simplifies signatures by removing location parameters.
 *
 * @example
 * ```typescript
 * const userOps: PrimaryOperations<User, 'user'> = {
 *   all: async () => database.getAllUsers(),
 *   get: async (key) => database.getUserById(key.pk),
 *   // ... other methods
 * };
 * ```
 */
export interface PrimaryOperations<
  V extends Item<S>,
  S extends string
> extends Omit<Operations<V, S>, 'create' | 'get' | 'update' | 'upsert' | 'remove' | 'action' | 'facet'> {
  // No locations needed for queries
  all(query?: ItemQuery): Promise<V[]>;
  one(query?: ItemQuery): Promise<V | null>;
  find(finder: string, params?: OperationParams): Promise<V[]>;
  findOne(finder: string, params?: OperationParams): Promise<V | null>;
  
  // Simplified create (only PriKey)
  create(item: Partial<Item<S>>, options?: { key?: PriKey<S> }): Promise<V>;
  
  // All CRUD uses PriKey only
  get(key: PriKey<S>): Promise<V | null>;
  update(key: PriKey<S>, item: Partial<Item<S>>): Promise<V>;
  upsert(key: PriKey<S>, item: Partial<Item<S>>): Promise<V>;
  remove(key: PriKey<S>): Promise<V | void>;
  
  // Actions use PriKey only
  action(key: PriKey<S>, action: string, params?: OperationParams): Promise<[V, AffectedKeys]>;
  allAction(action: string, params?: OperationParams): Promise<[V[], AffectedKeys]>;
  
  // Facets use PriKey only
  facet(key: PriKey<S>, facet: string, params?: OperationParams): Promise<any>;
  allFacet(facet: string, params?: OperationParams): Promise<any>;
}

/**
 * Operations interface for Contained Items (location hierarchy required).
 * Requires locations for all operations that need context.
 */
export interface ContainedOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends Omit<Operations<V, S, L1, L2, L3, L4, L5>, 'get' | 'update' | 'remove' | 'upsert' | 'action' | 'facet' | 'all' | 'one' | 'find' | 'findOne'> {
  // Require locations for queries - order: required params, optional params, required params
  all(query: ItemQuery | undefined, locations: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V[]>;
  one(query: ItemQuery | undefined, locations: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V | null>;
  find(finder: string, params: OperationParams | undefined, locations: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V[]>;
  findOne(finder: string, params: OperationParams | undefined, locations: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V | null>;
  
  // All CRUD uses ComKey only
  get(key: ComKey<S, L1, L2, L3, L4, L5>): Promise<V | null>;
  update(key: ComKey<S, L1, L2, L3, L4, L5>, item: Partial<Item<S, L1, L2, L3, L4, L5>>): Promise<V>;
  upsert(key: ComKey<S, L1, L2, L3, L4, L5>, item: Partial<Item<S, L1, L2, L3, L4, L5>>): Promise<V>;
  remove(key: ComKey<S, L1, L2, L3, L4, L5>): Promise<V | void>;
  
  // Actions use ComKey only
  action(key: ComKey<S, L1, L2, L3, L4, L5>, action: string, params?: OperationParams): Promise<[V, AffectedKeys]>;
  
  // Facets use ComKey only
  facet(key: ComKey<S, L1, L2, L3, L4, L5>, facet: string, params?: OperationParams): Promise<any>;
}

/**
 * Collection-focused operations interface.
 * Optimized for working with groups of items.
 * Used by React providers for array/list contexts.
 */
export interface CollectionOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  // Query operations
  all(query?: ItemQuery, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V[]>;
  one(query?: ItemQuery, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V | null>;
  find(finder: string, params?: OperationParams, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V[]>;
  findOne(finder: string, params?: OperationParams, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V | null>;
  
  // Create new items
  create(item: Partial<Item<S, L1, L2, L3, L4, L5>>, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<V>;
  
  // Collection-level operations
  allAction(action: string, params?: OperationParams, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<[V[], AffectedKeys]>;
  allFacet(facet: string, params?: OperationParams, locations?: LocKeyArray<L1, L2, L3, L4, L5> | []): Promise<any>;
}

/**
 * Instance-focused operations interface.
 * Optimized for working with a single specific item.
 * Used by React providers for single-item contexts.
 */
export interface InstanceOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  // Retrieve specific item
  get(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>): Promise<V | null>;
  
  // Modify specific item
  update(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>, item: Partial<Item<S, L1, L2, L3, L4, L5>>): Promise<V>;
  remove(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>): Promise<V | void>;
  
  // Instance-level operations
  action(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>, action: string, params?: OperationParams): Promise<[V, AffectedKeys]>;
  facet(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>, facet: string, params?: OperationParams): Promise<any>;
}


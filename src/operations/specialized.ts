import { Item } from "../items";
import { ComKey, LocKeyArray, PriKey } from "../keys";
import { ItemQuery } from "../item/ItemQuery";
import { AffectedKeys, OperationParams } from "./Operations";

/**
 * Specialized Operations Interfaces
 *
 * This file contains operation interfaces for specific usage patterns.
 * These are primarily used in UI layers (like React providers) to group
 * operations by their usage pattern rather than data structure.
 *
 * For core architectural patterns (Primary vs. Contained), see:
 * - primary.ts - Operations for top-level items
 * - contained.ts - Operations for hierarchical items
 */

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


import { Item } from "../items";
import { LocKeyArray } from "../keys";
import { AffectedKeys, OperationParams } from "./Operations";

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
 * Action method signature - performs action on single item
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
 * All-action method signature - performs action on multiple items
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
 * Facet method signature - computes view on single item
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
 * All-facet method signature - computes view on multiple items
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


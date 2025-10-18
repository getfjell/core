import { Item } from "../items";
import { ComKey, LocKeyArray } from "../keys";
import { ItemQuery } from "../item/ItemQuery";
import { AffectedKeys, OperationParams, Operations } from "./Operations";

/**
 * Contained Operations interface - specialized for contained (hierarchical) items only.
 *
 * This interface narrows the generic Operations interface to work exclusively
 * with ComKey and requires locations for collection operations.
 *
 * Contained items exist within a location hierarchy and belong to parent items.
 * Examples: Comments (in Posts), Annotations (in Documents), Tasks (in Projects)
 *
 * Use this for:
 * - Libraries that store contained items
 * - Caches for contained items
 * - API clients for contained endpoints
 * - Any operations that work with hierarchical data
 *
 * @example
 * ```typescript
 * // Define a contained item type
 * interface Comment extends Item<'comment', 'post'> {
 *   text: string;
 *   author: string;
 * }
 *
 * // Create operations for contained items
 * const commentOps: ContainedOperations<Comment, 'comment', 'post'> = createCommentOperations();
 *
 * // Only ComKey allowed - includes location hierarchy
 * await commentOps.get({
 *   kt: 'comment',
 *   pk: '123',
 *   loc: [{ kt: 'post', lk: 'post-1' }]
 * });
 *
 * await commentOps.update(
 *   { kt: 'comment', pk: '123', loc: [{ kt: 'post', lk: 'post-1' }] },
 *   { text: 'Updated comment' }
 * );
 *
 * // Locations required on collection methods
 * await commentOps.all({}, [{ kt: 'post', lk: 'post-1' }]);
 * await commentOps.find('recent', {}, [{ kt: 'post', lk: 'post-1' }]);
 * await commentOps.allAction('archive', {}, [{ kt: 'post', lk: 'post-1' }]);
 * ```
 */
export interface ContainedOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends Omit<Operations<V, S, L1, L2, L3, L4, L5>,
  'get' | 'update' | 'remove' | 'upsert' | 'create' |
  'action' | 'facet' | 'allAction' | 'allFacet' |
  'all' | 'one' | 'find' | 'findOne'> {
  
  // Collection query operations - locations required
  all(
    query: ItemQuery | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;

  one(
    query: ItemQuery | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;

  // Finder operations - locations required
  find(
    finder: string,
    params: OperationParams | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;

  findOne(
    finder: string,
    params: OperationParams | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;

  // Create operation - locations for context
  create(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: { locations?: LocKeyArray<L1, L2, L3, L4, L5> }
  ): Promise<V>;

  // CRUD operations - ComKey only
  get(key: ComKey<S, L1, L2, L3, L4, L5>): Promise<V | null>;

  update(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<V>;

  upsert(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<V>;

  remove(key: ComKey<S, L1, L2, L3, L4, L5>): Promise<V | void>;

  // Action operations - ComKey for instance, locations for collections
  action(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    action: string,
    params?: OperationParams
  ): Promise<[V, AffectedKeys]>;

  allAction(
    action: string,
    params: OperationParams | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], AffectedKeys]>;

  // Facet operations - ComKey for instance, locations for collections
  facet(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    facet: string,
    params?: OperationParams
  ): Promise<any>;

  allFacet(
    facet: string,
    params: OperationParams | undefined,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any>;
}


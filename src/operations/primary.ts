import { Item } from "../items";
import { PriKey } from "../keys";
import { ItemQuery } from "../item/ItemQuery";
import { AffectedKeys, OperationParams, Operations } from "./Operations";

/**
 * Primary Operations interface - specialized for primary (top-level) items only.
 *
 * This interface narrows the generic Operations interface to work exclusively
 * with PriKey. All operations accept only PriKey, never ComKey or locations.
 *
 * Primary items are top-level entities that don't belong to a location hierarchy.
 * Examples: Users, Organizations, Products, Documents
 *
 * Use this for:
 * - Libraries that store primary items
 * - Caches for primary items
 * - API clients for primary endpoints
 * - Any operations that work with non-hierarchical data
 *
 * @example
 * ```typescript
 * // Define a primary item type
 * interface User extends Item<'user'> {
 *   name: string;
 *   email: string;
 * }
 *
 * // Create operations for primary items
 * const userOps: PrimaryOperations<User, 'user'> = createUserOperations();
 *
 * // Only PriKey allowed - no locations
 * await userOps.get({ kt: 'user', pk: '123' });
 * await userOps.update({ kt: 'user', pk: '123' }, { name: 'Updated' });
 *
 * // No locations parameter on collection methods
 * await userOps.all({});
 * await userOps.find('byEmail', { email: 'test@example.com' });
 * await userOps.allAction('deactivate', { reason: 'inactive' });
 * ```
 */
export interface PrimaryOperations<
  V extends Item<S>,
  S extends string
> extends Omit<Operations<V, S>,
  'all' | 'one' | 'create' | 'get' | 'update' | 'upsert' | 'remove' |
  'find' | 'findOne' | 'action' | 'allAction' | 'facet' | 'allFacet'> {
  
  // Collection query operations - no locations needed
  all(query?: ItemQuery): Promise<V[]>;
  one(query?: ItemQuery): Promise<V | null>;

  // Finder operations - no locations
  find(finder: string, params?: OperationParams): Promise<V[]>;
  findOne(finder: string, params?: OperationParams): Promise<V | null>;

  // CRUD operations - PriKey only
  create(
    item: Partial<Item<S>>,
    options?: { key?: PriKey<S> }
  ): Promise<V>;

  get(key: PriKey<S>): Promise<V | null>;

  update(
    key: PriKey<S>,
    item: Partial<Item<S>>
  ): Promise<V>;

  upsert(
    key: PriKey<S>,
    item: Partial<Item<S>>
  ): Promise<V>;

  remove(key: PriKey<S>): Promise<V | void>;

  // Action operations - PriKey only, no locations
  action(
    key: PriKey<S>,
    action: string,
    params?: OperationParams
  ): Promise<[V, AffectedKeys]>;

  allAction(
    action: string,
    params?: OperationParams
  ): Promise<[V[], AffectedKeys]>;

  // Facet operations - PriKey only, no locations
  facet(
    key: PriKey<S>,
    facet: string,
    params?: OperationParams
  ): Promise<any>;

  allFacet(
    facet: string,
    params?: OperationParams
  ): Promise<any>;
}


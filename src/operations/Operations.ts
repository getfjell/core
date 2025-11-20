import { Item } from "../items";
import { ComKey, LocKeyArray, PriKey } from "../keys";
import { ItemQuery } from "../item/ItemQuery";

/**
 * Standard operation parameters type
 */
export type OperationParams = Record<
  string,
  string | number | boolean | Date | Array<string | number | boolean | Date>
>;

/**
 * Type for affected keys returned by actions
 */
export type AffectedKeys = Array<
  PriKey<any> | ComKey<any, any, any, any, any, any> | LocKeyArray<any, any, any, any, any>
>;

/**
 * Options for create operation
 */
export type CreateOptions<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = {
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  locations?: never;
} | {
  key?: never;
  locations: LocKeyArray<L1, L2, L3, L4, L5>,
};

/**
 * Options for update operations across all Fjell libraries.
 *
 * These options provide explicit control over update behavior,
 * with safe defaults that prevent accidental data loss.
 *
 * @public
 */
export interface UpdateOptions {
  /**
   * Controls whether the update replaces the entire document/record or merges with existing data.
   *
   * **Default: `false` (merge/partial update)**
   *
   * When `false` (default):
   * - Only the specified fields are updated
   * - All other existing fields are preserved
   * - Safe for partial updates
   * - Recommended for most use cases
   *
   * When `true`:
   * - The entire document/record is replaced with the provided data
   * - Any fields not included in the update payload are DELETED
   * - Use with extreme caution
   * - Logs warning before operation (in implementations)
   *
   * ⚠️ **WARNING**: Setting `replace: true` can lead to permanent data loss.
   * Always verify that your update payload contains ALL fields you want to preserve.
   *
   * @default false
   *
   * @example Merge update (default - safe)
   * ```typescript
   * // Existing: { id: '123', name: 'John', email: 'john@example.com', status: 'active' }
   * await operations.update(
   *   { kt: 'user', pk: '123' },
   *   { status: 'inactive' }
   * );
   * // Result: { id: '123', name: 'John', email: 'john@example.com', status: 'inactive' }
   * // ✅ All fields preserved except status
   * ```
   *
   * @example Full replacement (use with caution)
   * ```typescript
   * // Existing: { id: '123', name: 'John', email: 'john@example.com', status: 'active' }
   * await operations.update(
   *   { kt: 'user', pk: '123' },
   *   { status: 'inactive' },
   *   { replace: true }
   * );
   * // Result: { status: 'inactive' }
   * // ❌ name and email are DELETED!
   * ```
   */
  replace?: boolean;

  /**
   * Future options can be added here without breaking changes:
   * - validate?: boolean - Enable/disable validation
   * - dryRun?: boolean - Simulate update without committing
   * - skipCache?: boolean - Bypass cache layers
   * - returnPrevious?: boolean - Return previous value
   * - timeout?: number - Operation timeout
   */
}

/**
 * Core Operations interface for Item-based data access.
 * This interface defines the standard contract for all fjell libraries
 * that operate on Items.
 *
 * @template V - The Item type
 * @template S - The primary key type
 * @template L1-L5 - Location key types (optional, for contained items)
 *
 * @example
 * ```typescript
 * // Primary item operations
 * const userOps: Operations<User, 'user'> = ...;
 * const users = await userOps.all();
 *
 * // Contained item operations
 * const commentOps: Operations<Comment, 'comment', 'post'> = ...;
 * const comments = await commentOps.all({}, [{kt: 'post', lk: 'post-123'}]);
 * ```
 */
export interface Operations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  /**
   * Retrieves all items matching the query.
   *
   * @param query - Optional query to filter items
   * @param locations - Optional location hierarchy to scope the query
   * @returns Array of items matching the query
   *
   * @example
   * ```typescript
   * // Get all users
   * const users = await operations.all();
   *
   * // Get users with filter
   * const activeUsers = await operations.all({ filter: { status: 'active' } });
   *
   * // Get items in specific location
   * const comments = await operations.all({}, [{kt: 'post', lk: 'post-123'}]);
   * ```
   */
  all(
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;

  /**
   * Retrieves the first item matching the query.
   *
   * @param query - Optional query to filter items
   * @param locations - Optional location hierarchy to scope the query
   * @returns Single item or null if not found
   */
  one(
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;

  /**
   * Creates a new item.
   *
   * @param item - Partial item properties for creation
   * @param options - Optional key or locations for the new item
   * @returns The created item
   *
   * @example
   * ```typescript
   * // Create with auto-generated key
   * const user = await operations.create({ name: 'Alice' });
   *
   * // Create with specific key
   * const user = await operations.create(
   *   { name: 'Alice' },
   *   { key: { kt: 'user', pk: 'alice-123' } }
   * );
   *
   * // Create in specific location
   * const comment = await operations.create(
   *   { text: 'Great post!' },
   *   { locations: [{kt: 'post', lk: 'post-123'}] }
   * );
   * ```
   */
  create(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: CreateOptions<S, L1, L2, L3, L4, L5>
  ): Promise<V>;

  /**
   * Retrieves a single item by its key.
   *
   * @param key - Primary or composite key
   * @returns The item or null if not found
   *
   * @example
   * ```typescript
   * // Get by primary key
   * const user = await operations.get({ kt: 'user', pk: 'user-123' });
   *
   * // Get by composite key
   * const comment = await operations.get({
   *   kt: 'comment',
   *   pk: 'comment-456',
   *   loc: [{kt: 'post', lk: 'post-123'}]
   * });
   * ```
   */
  get(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | null>;

  /**
   * Updates an existing item.
   *
   * @param key - Primary or composite key
   * @param item - Partial item properties to update
   * @param options - Optional update options (controls merge vs replace behavior)
   * @returns The updated item
   *
   * @example Merge update (default - safe)
   * ```typescript
   * await operations.update(key, { status: 'active' });
   * // Merges with existing data, preserves other fields
   * ```
   *
   * @example Replace update (dangerous)
   * ```typescript
   * await operations.update(key, { status: 'active' }, { replace: true });
   * // Replaces entire document, deletes unspecified fields
   * ```
   */
  update(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: UpdateOptions
  ): Promise<V>;

  /**
   * Updates an item if it exists, creates it if it doesn't.
   *
   * @param key - Primary or composite key
   * @param item - Partial item properties
   * @param locations - Optional locations for creation
   * @param options - Optional update options (used only if item exists, ignored for creation)
   * @returns The upserted item
   */
  upsert(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
    options?: UpdateOptions
  ): Promise<V>;

  /**
   * Removes an item.
   *
   * @param key - Primary or composite key
   * @returns The removed item or void
   */
  remove(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | void>;

  /**
   * Executes a finder method by name.
   *
   * @param finder - Name of the finder method
   * @param params - Parameters for the finder
   * @param locations - Optional location hierarchy to scope the query
   * @returns Array of items found
   *
   * @example
   * ```typescript
   * // Find users by email
   * const users = await operations.find('byEmail', { email: 'alice@example.com' });
   *
   * // Find in specific location
   * const comments = await operations.find(
   *   'byAuthor',
   *   { author: 'alice' },
   *   [{kt: 'post', lk: 'post-123'}]
   * );
   * ```
   */
  find(
    finder: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;

  /**
   * Executes a finder method and returns the first result.
   *
   * @param finder - Name of the finder method
   * @param params - Parameters for the finder
   * @param locations - Optional location hierarchy to scope the query
   * @returns Single item or null
   */
  findOne(
    finder: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null>;

  /**
   * Executes an action on a specific item.
   * Actions are operations that may have side effects or modify the item.
   *
   * @param key - Primary or composite key
   * @param action - Name of the action
   * @param params - Parameters for the action
   * @returns Tuple of [updated item, affected keys for cache invalidation]
   *
   * @example
   * ```typescript
   * const [user, affectedKeys] = await operations.action(
   *   { kt: 'user', pk: 'user-123' },
   *   'promote',
   *   { role: 'admin' }
   * );
   * ```
   */
  action(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    action: string,
    params?: OperationParams
  ): Promise<[V, AffectedKeys]>;

  /**
   * Executes an action on all items matching criteria.
   *
   * @param action - Name of the action
   * @param params - Parameters for the action
   * @param locations - Optional location hierarchy to scope the action
   * @returns Tuple of [updated items, affected keys for cache invalidation]
   */
  allAction(
    action: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], AffectedKeys]>;

  /**
   * Executes a facet query on a specific item.
   * Facets are read-only computed views of item data.
   *
   * @param key - Primary or composite key
   * @param facet - Name of the facet
   * @param params - Parameters for the facet
   * @returns Facet result data
   *
   * @example
   * ```typescript
   * const stats = await operations.facet(
   *   { kt: 'user', pk: 'user-123' },
   *   'statistics',
   *   { period: 'month' }
   * );
   * ```
   */
  facet(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    facet: string,
    params?: OperationParams
  ): Promise<any>;

  /**
   * Executes a facet query on all items matching criteria.
   * Facets are read-only computed views of item data.
   *
   * @param facet - Name of the facet
   * @param params - Parameters for the facet
   * @param locations - Optional location hierarchy to scope the query
   * @returns Facet result data
   */
  allFacet(
    facet: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any>;
}

/**
 * Type guard to check if key is a PriKey
 *
 * @param key - Key to check
 * @returns true if key is a PriKey
 *
 * @example
 * ```typescript
 * if (isPriKey(key)) {
 *   // key is PriKey<S>
 *   console.log(key.kt, key.pk);
 * }
 * ```
 */
export function isPriKey<S extends string>(
  key: PriKey<S> | ComKey<S, any, any, any, any, any>
): key is PriKey<S> {
  return !('loc' in key) || !key.loc;
}

/**
 * Type guard to check if key is a ComKey
 *
 * @param key - Key to check
 * @returns true if key is a ComKey
 *
 * @example
 * ```typescript
 * if (isComKey(key)) {
 *   // key is ComKey<S, L1, L2, L3, L4, L5>
 *   console.log(key.kt, key.pk, key.loc);
 * }
 * ```
 */
export function isComKey<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
): key is ComKey<S, L1, L2, L3, L4, L5> {
  return 'loc' in key && key.loc && Array.isArray(key.loc) && key.loc.length > 0;
}


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
 * Base options for pagination operations (all() and find()).
 *
 * Contains the common pagination parameters shared by both operations.
 *
 * @public
 */
export interface PaginationOptions {
  /**
   * Maximum number of items to return.
   *
   * - Must be a positive integer (>= 1)
   * - When not provided, returns all matching items
   * - Takes precedence over query.limit when both are specified
   */
  limit?: number;

  /**
   * Number of items to skip before returning results.
   *
   * - Must be a non-negative integer (>= 0)
   * - Defaults to 0 when not provided
   * - Takes precedence over query.offset when both are specified
   */
  offset?: number;
}

/**
 * Options for the all() operation with pagination support.
 *
 * When provided, these options take precedence over any limit/offset
 * specified in the ItemQuery.
 *
 * @public
 *
 * @example
 * ```typescript
 * // Fetch first 50 items
 * const result = await operations.all(query, [], { limit: 50, offset: 0 });
 *
 * // Fetch next page
 * const nextPage = await operations.all(query, [], { limit: 50, offset: 50 });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AllOptions extends PaginationOptions {
  // Future all-specific options can be added here without breaking changes
}

/**
 * Options for the find() operation with pagination support.
 *
 * When provided, these options take precedence over any limit/offset
 * passed to finder functions.
 *
 * @public
 *
 * @example
 * ```typescript
 * // Find with pagination
 * const findResult = await operations.find('byEmail', { email: 'test@example.com' }, [], { limit: 10 });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FindOptions extends PaginationOptions {
  // Future find-specific options can be added here without breaking changes
}

/**
 * Metadata about the pagination state for an all() operation.
 *
 * This metadata enables proper pagination UI and logic by providing
 * the total count of matching items before limit/offset are applied.
 *
 * @public
 */
export interface PaginationMetadata {
  /**
   * Total count of items matching the query BEFORE limit/offset applied.
   *
   * This represents the complete result set size and is used to:
   * - Display "Showing X of Y results"
   * - Calculate total pages
   * - Determine if more items exist
   */
  total: number;

  /**
   * Number of items actually returned in this response.
   *
   * This equals `items.length` and is provided for convenience.
   * When offset + returned < total, more items exist.
   */
  returned: number;

  /**
   * The limit that was applied, if any.
   *
   * - Undefined when no limit was applied
   * - Reflects the effective limit (options.limit ?? query.limit)
   */
  limit?: number;

  /**
   * The offset that was applied.
   *
   * - 0 when no offset was applied
   * - Reflects the effective offset (options.offset ?? query.offset ?? 0)
   */
  offset: number;

  /**
   * Convenience field indicating whether more items exist beyond this page.
   *
   * Calculated as: `offset + returned < total`
   *
   * Useful for:
   * - "Load More" buttons
   * - Infinite scroll implementations
   * - "Next Page" button state
   */
  hasMore: boolean;
}

/**
 * Base result structure for paginated operations.
 *
 * This structure provides both the items and metadata needed for
 * implementing proper pagination in applications.
 *
 * @template T - The item type being returned
 *
 * @public
 */
export interface OperationResult<T> {
  /**
   * Array of items matching the query, with limit/offset applied.
   */
  items: T[];

  /**
   * Pagination metadata for the result set.
   */
  metadata: PaginationMetadata;
}

/**
 * Result structure for the all() operation with pagination support.
 *
 * This structure provides both the items and metadata needed for
 * implementing proper pagination in applications.
 *
 * @template T - The item type being returned
 *
 * @public
 *
 * @example
 * ```typescript
 * const result = await operations.all(query, [], { limit: 50, offset: 0 });
 *
 * console.log(`Showing ${result.metadata.returned} of ${result.metadata.total}`);
 * // "Showing 50 of 1234"
 *
 * if (result.metadata.hasMore) {
 *   // Load next page
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AllOperationResult<T> extends OperationResult<T> {
  // Future all-specific result properties can be added here without breaking changes
}

/**
 * Result structure for the find() operation with pagination support.
 *
 * This structure provides both the items and metadata needed for
 * implementing proper pagination in find operations.
 *
 * @template T - The item type being returned
 *
 * @public
 *
 * @example
 * ```typescript
 * const result = await operations.find('byEmail', { email: 'test@example.com' }, [], { limit: 10 });
 *
 * console.log(`Found ${result.metadata.returned} of ${result.metadata.total} results`);
 * // "Found 10 of 25 results"
 *
 * if (result.metadata.hasMore) {
 *   // Load next page
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FindOperationResult<T> extends OperationResult<T> {
  // Future find-specific result properties can be added here without breaking changes
}

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
   * Retrieves all items matching the query with optional pagination.
   *
   * @param query - Optional query to filter items (may include limit/offset for backwards compatibility)
   * @param locations - Optional location hierarchy to scope the query
   * @param options - Optional pagination options (takes precedence over query limit/offset)
   * @returns Result containing items and pagination metadata
   *
   * @example Get all items
   * ```typescript
   * const result = await operations.all();
   * // result.items = all items
   * // result.metadata.total = items.length
   * ```
   *
   * @example Get paginated items
   * ```typescript
   * const result = await operations.all({}, [], { limit: 50, offset: 0 });
   * // result.items = first 50 items
   * // result.metadata.total = total matching count
   * // result.metadata.hasMore = true if more exist
   * ```
   *
   * @example Get items in specific location with pagination
   * ```typescript
   * const result = await operations.all(
   *   {},
   *   [{kt: 'post', lk: 'post-123'}],
   *   { limit: 20, offset: 0 }
   * );
   * ```
   */
  all(
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    options?: AllOptions
  ): Promise<AllOperationResult<V>>;

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
   * Executes a finder method by name with optional pagination support.
   *
   * Supports hybrid pagination approach:
   * - If finder returns FindOperationResult<V>, uses it directly (opt-in)
   * - If finder returns V[], framework applies post-processing pagination
   *
   * @param finder - Name of the finder method
   * @param params - Parameters for the finder
   * @param locations - Optional location hierarchy to scope the query
   * @param options - Optional pagination options (limit, offset)
   * @returns Result containing items and pagination metadata
   *
   * @example
   * ```typescript
   * // Find users by email (no pagination)
   * const result = await operations.find('byEmail', { email: 'alice@example.com' });
   * const users = result.items;
   *
   * // Find with pagination
   * const result = await operations.find(
   *   'byAuthor',
   *   { author: 'alice' },
   *   [{kt: 'post', lk: 'post-123'}],
   *   { limit: 10, offset: 0 }
   * );
   * const comments = result.items;
   * const total = result.metadata.total;
   * ```
   */
  find(
    finder: string,
    params?: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    options?: FindOptions
  ): Promise<FindOperationResult<V>>;

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


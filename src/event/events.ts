import { ComKey, PriKey } from '../keys';
import { Item } from '../items';

/**
 * Base event interface that all events extend.
 * Provides core event properties with full type safety using the existing PriKey/ComKey system.
 */
export interface BaseEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /** Type of event - "create", "update", "delete", etc. */
  eventType: string;
  
  /** The key of the item that was affected - maintains full type safety */
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>;
  
  /** Which storage backend(s) generated this event - enables filtering by implementation */
  scopes: string[];
  
  /** When the event occurred */
  timestamp: Date;
  
  /** Optional: the full item content - fully typed, no loss of type information */
  item?: Item<S, L1, L2, L3, L4, L5>;
}

/**
 * Event emitted when an item is created.
 * The item property is required since we always have the created item data.
 */
export interface CreateEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseEvent<S, L1, L2, L3, L4, L5> {
  eventType: 'create';
  /** The created item - always available for create events */
  item: Item<S, L1, L2, L3, L4, L5>;
}

/**
 * Event emitted when an item is updated.
 * Provides detailed change tracking with before/after states.
 */
export interface UpdateEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseEvent<S, L1, L2, L3, L4, L5> {
  eventType: 'update';
  /** List of field names that were changed */
  changes: string[];
  /** Optional: item state before the update */
  before?: Item<S, L1, L2, L3, L4, L5>;
  /** Optional: item state after the update */
  after?: Item<S, L1, L2, L3, L4, L5>;
  // Note: item property (from BaseEvent) contains current state if provided
}

/**
 * Event emitted when an item is deleted.
 * May include the deleted item data for cleanup/undo operations.
 */
export interface DeleteEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseEvent<S, L1, L2, L3, L4, L5> {
  eventType: 'delete';
  /** Optional: the deleted item content - useful for cleanup/undo */
  item?: Item<S, L1, L2, L3, L4, L5>;
}

/**
 * Event emitted when a custom action is performed on an item.
 * Allows libraries to define custom event types beyond standard CRUD.
 */
export interface ActionEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseEvent<S, L1, L2, L3, L4, L5> {
  eventType: 'action';
  /** Name of the action that was performed */
  actionName: string;
  /** Optional: action-specific data */
  actionData?: Record<string, unknown>;
}

/**
 * Union type of all standard event types.
 * Libraries can extend this with custom events if needed.
 */
export type Event<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> =
  | CreateEvent<S, L1, L2, L3, L4, L5>
  | UpdateEvent<S, L1, L2, L3, L4, L5>
  | DeleteEvent<S, L1, L2, L3, L4, L5>
  | ActionEvent<S, L1, L2, L3, L4, L5>;

/**
 * Type guard to check if an event is a CreateEvent
 */
export function isCreateEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(event: BaseEvent<S, L1, L2, L3, L4, L5>): event is CreateEvent<S, L1, L2, L3, L4, L5> {
  return event.eventType === 'create';
}

/**
 * Type guard to check if an event is an UpdateEvent
 */
export function isUpdateEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(event: BaseEvent<S, L1, L2, L3, L4, L5>): event is UpdateEvent<S, L1, L2, L3, L4, L5> {
  return event.eventType === 'update';
}

/**
 * Type guard to check if an event is a DeleteEvent
 */
export function isDeleteEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(event: BaseEvent<S, L1, L2, L3, L4, L5>): event is DeleteEvent<S, L1, L2, L3, L4, L5> {
  return event.eventType === 'delete';
}

/**
 * Type guard to check if an event is an ActionEvent
 */
export function isActionEvent<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(event: BaseEvent<S, L1, L2, L3, L4, L5>): event is ActionEvent<S, L1, L2, L3, L4, L5> {
  return event.eventType === 'action';
}

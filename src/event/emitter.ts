import { ComKey, Item, ItemTypeArray, LocKeyArray, PriKey } from '@fjell/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActionEvent, BaseEvent, CreateEvent, DeleteEvent, UpdateEvent } from './events';
import { Subscription, SubscriptionOptions } from './subscription';

/**
 * Core EventEmitter interface that storage libraries implement.
 * Each item type gets its own EventEmitter instance for full type safety.
 * Libraries implement separate EventEmitters per item type (UserEventEmitter, MessageEventEmitter, etc.)
 */
export interface EventEmitter<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /**
   * Emit a generic event with full control over event properties.
   * Libraries can use this for custom events or when they need full control.
   */
  emit(event: BaseEvent<S, L1, L2, L3, L4, L5>): Promise<void>;

  /**
   * Emit a create event when an item is created.
   * Convenience method that constructs a properly typed CreateEvent.
   */
  emitCreate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    scopes: string[],
    item: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit an update event when an item is modified.
   * Convenience method that constructs a properly typed UpdateEvent.
   */
  emitUpdate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    scopes: string[],
    changes: string[],
    before?: Item<S, L1, L2, L3, L4, L5>,
    after?: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit a delete event when an item is deleted.
   * Convenience method that constructs a properly typed DeleteEvent.
   */
  emitDelete(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    scopes: string[],
    item?: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit an action event when a custom action is performed.
   * Convenience method that constructs a properly typed ActionEvent.
   */
  emitAction(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    scopes: string[],
    actionName: string,
    actionData?: Record<string, unknown>
  ): Promise<void>;

  /**
   * Create a scoped emitter that automatically includes the specified scopes.
   * Libraries can use this to avoid passing scopes to every emit call.
   */
  withScopes(scopes: string[]): ScopedEventEmitter<S, L1, L2, L3, L4, L5>;
}

/**
 * Scoped EventEmitter that automatically includes configured scopes.
 * Convenience interface for libraries to avoid passing scopes repeatedly.
 */
export interface ScopedEventEmitter<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /** The scopes that will be automatically included in all events */
  readonly scopes: string[];

  /**
   * Emit a generic event with automatic scope inclusion.
   * The event should omit scopes since they'll be added automatically.
   */
  emit(event: Omit<BaseEvent<S, L1, L2, L3, L4, L5>, 'scopes'>): Promise<void>;

  /**
   * Emit a create event with automatic scope inclusion.
   */
  emitCreate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit an update event with automatic scope inclusion.
   */
  emitUpdate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    changes: string[],
    before?: Item<S, L1, L2, L3, L4, L5>,
    after?: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit a delete event with automatic scope inclusion.
   */
  emitDelete(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item?: Item<S, L1, L2, L3, L4, L5>
  ): Promise<void>;

  /**
   * Emit an action event with automatic scope inclusion.
   */
  emitAction(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    actionName: string,
    actionData?: Record<string, unknown>
  ): Promise<void>;
}

/**
 * EventSubscriber interface for subscribing to and receiving events.
 * Each item type gets its own EventSubscriber instance for full type safety.
 */
export interface EventSubscriber<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /**
   * Subscribe to events using a full subscription object.
   * Returns the subscription ID for later unsubscribing.
   */
  subscribe(subscription: Omit<Subscription<S, L1, L2, L3, L4, L5>, 'id'>): Promise<string>;

  /**
   * Unsubscribe from events using the subscription ID.
   */
  unsubscribe(subscriptionId: string): Promise<void>;

  /**
   * Register a callback to be called when events are received.
   * Multiple callbacks can be registered and they'll all be called.
   */
  onEvent(callback: (event: BaseEvent<S, L1, L2, L3, L4, L5>) => void): void;

  /**
   * Remove a previously registered event callback.
   */
  removeEventListener(callback: (event: BaseEvent<S, L1, L2, L3, L4, L5>) => void): void;

  /**
   * Convenience method to subscribe to a specific item.
   * Automatically creates an ItemSubscription with the provided options.
   */
  subscribeToItem(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    options?: SubscriptionOptions<S, L1, L2, L3, L4, L5>
  ): Promise<string>;

  /**
   * Convenience method to subscribe to a location.
   * Automatically creates a LocationSubscription with the provided options.
   */
  subscribeToLocation(
    kta: ItemTypeArray<S, L1, L2, L3, L4, L5>,
    location: LocKeyArray<L1, L2, L3, L4, L5>,
    options?: SubscriptionOptions<S, L1, L2, L3, L4, L5>
  ): Promise<string>;

  /**
   * Get all currently active subscriptions.
   * Useful for debugging and subscription management.
   */
  getActiveSubscriptions(): Subscription<S, L1, L2, L3, L4, L5>[];

  /**
   * Check if an event matches any active subscriptions.
   * Used internally by libraries to determine if an event should be processed.
   */
  matchesSubscription(event: BaseEvent<S, L1, L2, L3, L4, L5>): boolean;

  /**
   * Check if an event matches a specific subscription.
   * Used internally for subscription matching logic.
   */
  matchesSpecificSubscription(
    event: BaseEvent<S, L1, L2, L3, L4, L5>,
    subscription: Subscription<S, L1, L2, L3, L4, L5>
  ): boolean;
}

/**
 * Combined EventSystem interface that includes both emitter and subscriber.
 * Libraries can implement this interface to provide both event emission and subscription.
 */
export interface EventSystem<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /** Event emitter for publishing events */
  readonly emitter: EventEmitter<S, L1, L2, L3, L4, L5>;
  
  /** Event subscriber for receiving events */
  readonly subscriber: EventSubscriber<S, L1, L2, L3, L4, L5>;
}

/**
 * Factory function type for creating EventSystems.
 * Libraries implement this to create properly configured event systems.
 */
export type EventSystemFactory<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = (scopes: string[]) => EventSystem<S, L1, L2, L3, L4, L5>;

// Type aliases for common usage patterns in libraries
export type UserEventEmitter = EventEmitter<'User'>;
export type UserEventSubscriber = EventSubscriber<'User'>;
export type UserEventSystem = EventSystem<'User'>;

export type MessageEventEmitter<L1 extends string, L2 extends string> = EventEmitter<'Message', L1, L2>;
export type MessageEventSubscriber<L1 extends string, L2 extends string> = EventSubscriber<'Message', L1, L2>;
export type MessageEventSystem<L1 extends string, L2 extends string> = EventSystem<'Message', L1, L2>;

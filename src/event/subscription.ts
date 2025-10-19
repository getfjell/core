/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComKey, ItemTypeArray, LocKeyArray, PriKey } from '../keys';
import { ItemQuery } from '../item/ItemQuery';

/**
 * Base subscription interface that all subscription types extend.
 * Provides core subscription properties with full type safety.
 */
 
export interface BaseSubscription {
  /** Unique subscription identifier - generated when subscription is created */
  id: string;
  
  /** Optional: specific event types to listen for (defaults to all if not specified) */
  eventTypes?: string[];
  
  /** Optional: storage backends to listen to (defaults to all if not specified) */
  scopes?: string[];
  
  /** Optional: additional filtering criteria using existing ItemQuery system */
  query?: ItemQuery;
}

/**
 * Subscription to events for a specific item using PriKey or ComKey.
 * Provides exact item-level event subscriptions with full type safety.
 */
export interface ItemSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseSubscription {
  /** The specific key to subscribe to - fully typed PriKey or ComKey */
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>;
}

/**
 * Subscription to events for all items in a location using KTA + location array.
 * Provides location-based event subscriptions with full type safety.
 */
export interface LocationSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseSubscription {
  /** Item type array defining the type hierarchy */
  kta: ItemTypeArray<S, L1, L2, L3, L4, L5>;
  
  /** Location key array defining the specific location */
  location: LocKeyArray<L1, L2, L3, L4, L5>;
}

/**
 * Union type of all subscription types.
 * This allows handling any subscription type generically while maintaining type safety.
 */
export type Subscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = ItemSubscription<S, L1, L2, L3, L4, L5> | LocationSubscription<S, L1, L2, L3, L4, L5>;

/**
 * Options for creating subscriptions.
 * Used by convenience methods to create subscriptions without requiring full subscription objects.
 */
 
export interface SubscriptionOptions<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /** Optional: specific event types to listen for */
  eventTypes?: string[];
  
  /** Optional: storage backends to listen to */
  scopes?: string[];
  
  /** Optional: additional filtering criteria */
  query?: ItemQuery;
}

/**
 * Type guard to check if a subscription is an ItemSubscription
 */
 
export function isItemSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(subscription: Subscription<S, L1, L2, L3, L4, L5>): subscription is ItemSubscription<S, L1, L2, L3, L4, L5> {
  return 'key' in subscription;
}

/**
 * Type guard to check if a subscription is a LocationSubscription
 */
 
export function isLocationSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(subscription: Subscription<S, L1, L2, L3, L4, L5>): subscription is LocationSubscription<S, L1, L2, L3, L4, L5> {
  return 'kta' in subscription && 'location' in subscription;
}

/**
 * Utility function to generate unique subscription IDs.
 * Libraries can use this or implement their own ID generation strategy.
 */
export function generateSubscriptionId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility function to create an ItemSubscription with generated ID.
 * Simplifies subscription creation for library implementations.
 */
export function createItemSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  options?: SubscriptionOptions<S, L1, L2, L3, L4, L5>
): ItemSubscription<S, L1, L2, L3, L4, L5> {
  return {
    id: generateSubscriptionId(),
    key,
    eventTypes: options?.eventTypes,
    scopes: options?.scopes,
    query: options?.query,
  };
}

/**
 * Utility function to create a LocationSubscription with generated ID.
 * Simplifies subscription creation for library implementations.
 */
export function createLocationSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  kta: ItemTypeArray<S, L1, L2, L3, L4, L5>,
  location: LocKeyArray<L1, L2, L3, L4, L5>,
  options?: SubscriptionOptions<S, L1, L2, L3, L4, L5>
): LocationSubscription<S, L1, L2, L3, L4, L5> {
  return {
    id: generateSubscriptionId(),
    kta,
    location,
    eventTypes: options?.eventTypes,
    scopes: options?.scopes,
    query: options?.query,
  };
}

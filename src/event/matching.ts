import { ComKey, ItemTypeArray, LocKeyArray, PriKey } from '@fjell/types';
import { isComKey, isPriKey } from '../key/KUtils';
import { BaseEvent } from './events';
import { isItemSubscription, isLocationSubscription, Subscription } from './subscription';

/**
 * Core subscription matching logic.
 * Determines whether an event should be delivered to a specific subscription.
 */
export function doesEventMatchSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  event: BaseEvent<S, L1, L2, L3, L4, L5>,
  subscription: Subscription<S, L1, L2, L3, L4, L5>
): boolean {
  // Check scope compatibility first (most efficient filter)
  if (!doesScopeMatch(event.scopes, subscription.scopes)) {
    return false;
  }

  // Check event type compatibility
  if (!doesEventTypeMatch(event.eventType, subscription.eventTypes)) {
    return false;
  }

  // Check key/location pattern matching
  if (isItemSubscription(subscription)) {
    return doesKeyMatch(event.key, subscription.key);
  } else if (isLocationSubscription(subscription)) {
    return doesKeyMatchLocation(event.key, subscription.kta, subscription.location);
  }

  return false;
}

/**
 * Check if event scopes match subscription scope requirements.
 *
 * @param eventScopes - Scopes from the event (e.g., ["firestore"])
 * @param subscriptionScopes - Optional scopes required by subscription
 * @returns true if scopes are compatible
 */
export function doesScopeMatch(
  eventScopes: string[],
  subscriptionScopes?: string[]
): boolean {
  // If subscription doesn't specify scopes, accept events from any scope
  if (!subscriptionScopes || subscriptionScopes.length === 0) {
    return true;
  }

  // Check if any of the event's scopes match any of the subscription's required scopes
  return subscriptionScopes.some(requiredScope =>
    eventScopes.includes(requiredScope)
  );
}

/**
 * Check if event type matches subscription event type requirements.
 *
 * @param eventType - Type from the event (e.g., "create", "update")
 * @param subscriptionEventTypes - Optional event types required by subscription
 * @returns true if event type is compatible
 */
export function doesEventTypeMatch(
  eventType: string,
  subscriptionEventTypes?: string[]
): boolean {
  // If subscription doesn't specify event types, accept all event types
  if (!subscriptionEventTypes || subscriptionEventTypes.length === 0) {
    return true;
  }

  // Check if the event type is in the subscription's allowed types
  return subscriptionEventTypes.includes(eventType);
}

/**
 * Check if two keys are exactly equal.
 * Used for item-based subscriptions that want events for a specific key.
 */
export function doesKeyMatch<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  eventKey: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  subscriptionKey: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
): boolean {
  // Both must be the same type (PriKey or ComKey)
  if (isPriKey(eventKey) && isPriKey(subscriptionKey)) {
    return eventKey.pk === subscriptionKey.pk && eventKey.kt === subscriptionKey.kt;
  }

  if (isComKey(eventKey) && isComKey(subscriptionKey)) {
    const eventComKey = eventKey as ComKey<S, L1, L2, L3, L4, L5>;
    const subscriptionComKey = subscriptionKey as ComKey<S, L1, L2, L3, L4, L5>;
    
    // Compare primary key and key type
    if (eventComKey.pk !== subscriptionComKey.pk || eventComKey.kt !== subscriptionComKey.kt) {
      return false;
    }

    // Compare location arrays
    if (eventComKey.loc.length !== subscriptionComKey.loc.length) {
      return false;
    }

    // Check each location key
    return eventComKey.loc.every((eventLocKey, index) => {
      const subLocKey = subscriptionComKey.loc[index];
      return eventLocKey.lk === subLocKey.lk && eventLocKey.kt === subLocKey.kt;
    });
  }

  return false; // Different key types don't match
}

/**
 * Check if an event key matches a location-based subscription.
 * This is more complex as it needs to determine if the event key is "within" the subscription location.
 */
export function doesKeyMatchLocation<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  eventKey: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  subscriptionKta: ItemTypeArray<S, L1, L2, L3, L4, L5>,
  subscriptionLocation: LocKeyArray<L1, L2, L3, L4, L5>
): boolean {
  // First, check if the key type matches the target type in the KTA
  const targetItemType = subscriptionKta[subscriptionKta.length - 1];
  if (eventKey.kt !== targetItemType) {
    return false;
  }

  // For PriKey events
  if (isPriKey(eventKey)) {
    // PriKey can only match location subscriptions with empty locations (root level)
    return subscriptionLocation.length === 0;
  }

  // For ComKey events
  if (isComKey(eventKey)) {
    const comKey = eventKey as ComKey<S, L1, L2, L3, L4, L5>;
    // The event's location must match the subscription location exactly or be a sub-location
    return doesLocationMatch(comKey.loc, subscriptionLocation, subscriptionKta);
  }

  return false;
}

/**
 * Check if an event's location keys match a subscription's location requirements.
 * This implements the hierarchical location matching logic.
 */
export function doesLocationMatch<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  eventLocation: LocKeyArray<L1, L2, L3, L4, L5>,
  subscriptionLocation: LocKeyArray<L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _subscriptionKta: ItemTypeArray<string, L1, L2, L3, L4, L5>
): boolean {
  // If subscription location is empty, it matches all locations (root level subscription)
  if (subscriptionLocation.length === 0) {
    return true;
  }

  // Event location must be at least as deep as subscription location
  if (eventLocation.length < subscriptionLocation.length) {
    return false;
  }

  // Check that all subscription location keys match the corresponding event location keys
  for (let i = 0; i < subscriptionLocation.length; i++) {
    const eventLocKey = eventLocation[i];
    const subLocKey = subscriptionLocation[i];

    if (!eventLocKey || !subLocKey) {
      return false;
    }

    if (eventLocKey.lk !== subLocKey.lk || eventLocKey.kt !== subLocKey.kt) {
      return false;
    }
  }

  return true;
}

/**
 * Find all subscriptions that match a given event.
 * Used by EventSubscriber implementations to determine which subscriptions should receive an event.
 */
export function findMatchingSubscriptions<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  event: BaseEvent<S, L1, L2, L3, L4, L5>,
  subscriptions: Subscription<S, L1, L2, L3, L4, L5>[]
): Subscription<S, L1, L2, L3, L4, L5>[] {
  return subscriptions.filter(subscription =>
    doesEventMatchSubscription(event, subscription)
  );
}

/**
 * Utility function to extract the location from a ComKey for comparison purposes.
 * Returns the location key values as strings for easier comparison.
 */
export function extractLocationValues<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(location: LocKeyArray<L1, L2, L3, L4, L5>): string[] {
  return location.map(locKey => String(locKey.lk));
}

/**
 * Utility function to compare two location arrays by their values.
 * Useful for debugging and testing location matching logic.
 */
export function compareLocationValues<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  location1: LocKeyArray<L1, L2, L3, L4, L5>,
  location2: LocKeyArray<L1, L2, L3, L4, L5>
): boolean {
  if (location1.length !== location2.length) {
    return false;
  }

  return location1.every((locKey1, index) => {
    const locKey2 = location2[index];
    return locKey1.lk === locKey2.lk && locKey1.kt === locKey2.kt;
  });
}

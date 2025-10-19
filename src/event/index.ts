/**
 * @fileoverview Event System Public API
 *
 * This module exports all the public interfaces and utilities for the Fjell event system.
 * The event system provides type-safe, item-level change events with full PriKey/ComKey integration.
 *
 * Key Features:
 * - Full type safety using existing PriKey/ComKey system
 * - Storage-agnostic event interfaces
 * - Item-specific and location-based subscriptions
 * - Separate EventEmitters per item type for optimal type safety
 * - Real-time awareness for application needs (not reliable business execution)
 *
 * Usage:
 * - Libraries implement EventEmitter/EventSubscriber interfaces
 * - Applications subscribe to events through library instances
 * - Events are delivered through callback functions with full type safety
 */

// Core Event Types
export {
  BaseEvent,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
  ActionEvent,
  Event,
  isCreateEvent,
  isUpdateEvent,
  isDeleteEvent,
  isActionEvent,
} from './events';

// Subscription Interfaces
export {
  BaseSubscription,
  ItemSubscription,
  LocationSubscription,
  Subscription,
  SubscriptionOptions,
  isItemSubscription,
  isLocationSubscription,
  generateSubscriptionId,
  createItemSubscription,
  createLocationSubscription,
} from './subscription';

// Event Emitter/Subscriber Interfaces
export {
  EventEmitter,
  ScopedEventEmitter,
  EventSubscriber,
  EventSystem,
  EventSystemFactory,
  // Type aliases for common patterns
  UserEventEmitter,
  UserEventSubscriber,
  UserEventSystem,
  MessageEventEmitter,
  MessageEventSubscriber,
  MessageEventSystem,
} from './emitter';

// Subscription Matching Logic
export {
  doesEventMatchSubscription,
  doesScopeMatch,
  doesEventTypeMatch,
  doesKeyMatch,
  doesKeyMatchLocation,
  doesLocationMatch,
  findMatchingSubscriptions,
  extractLocationValues,
  compareLocationValues,
} from './matching';

// Shared Types and Utilities
export {
  STANDARD_EVENT_TYPES,
  StandardEventType,
  STANDARD_SCOPES,
  StandardScope,
  SubscriptionStatus,
  SubscriptionMetadata,
  ManagedSubscription,
  EventHandler,
  SafeEventHandler,
  EventBatch,
  EventStats,
  EventSystemConfig,
  DEFAULT_EVENT_CONFIG,
  EventSystemError,
  SubscriptionError,
  EventEmissionError,
  EventMatchingError,
  createEventSystemError,
  isEventSystemError,
  ExtractItemType,
  ExtractEventTypes,
} from './types';

/**
 * Version of the event system API.
 * Used for compatibility checking and debugging.
 */
export const EVENT_SYSTEM_VERSION = '1.0.0';

/**
 * Supported event types for reference.
 * Libraries should use these standard types for consistency.
 */
export const SUPPORTED_EVENT_TYPES = [
  'create',
  'update',
  'delete',
  'action',
] as const;

/**
 * Supported storage scopes for reference.
 * Libraries should use these standard scopes for consistency.
 */
export const SUPPORTED_SCOPES = [
  'firestore',
  'sequelize',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
] as const;

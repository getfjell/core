import { BaseEvent } from './events';
import { Subscription } from './subscription';

/**
 * Common event types used throughout the event system.
 * Libraries can extend these with custom event types as needed.
 */
export const STANDARD_EVENT_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ACTION: 'action',
} as const;

/**
 * Type for standard event type values.
 */
export type StandardEventType = typeof STANDARD_EVENT_TYPES[keyof typeof STANDARD_EVENT_TYPES];

/**
 * Common scope identifiers used by storage libraries.
 * Libraries should use these standard scopes for consistency.
 */
export const STANDARD_SCOPES = {
  FIRESTORE: 'firestore',
  SEQUELIZE: 'sequelize',
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql',
  MONGODB: 'mongodb',
  REDIS: 'redis',
} as const;

/**
 * Type for standard scope values.
 */
export type StandardScope = typeof STANDARD_SCOPES[keyof typeof STANDARD_SCOPES];

/**
 * Status of a subscription.
 * Used to track subscription lifecycle and health.
 */
export enum SubscriptionStatus {
  PENDING = 'pending',     // Subscription created but not yet active
  ACTIVE = 'active',       // Subscription is active and receiving events
  PAUSED = 'paused',       // Subscription is paused (not receiving events)
  ERROR = 'error',         // Subscription has encountered an error
  CANCELLED = 'cancelled', // Subscription has been cancelled/unsubscribed
}

/**
 * Metadata about a subscription's current state.
 * Used for monitoring and debugging subscription health.
 */
export interface SubscriptionMetadata {
  /** Current status of the subscription */
  status: SubscriptionStatus;
  
  /** When the subscription was created */
  createdAt: Date;
  
  /** When the subscription was last updated */
  updatedAt: Date;
  
  /** When the subscription last received an event */
  lastEventAt?: Date;
  
  /** Total number of events received by this subscription */
  eventCount: number;
  
  /** Any error that occurred with this subscription */
  lastError?: Error;
  
  /** Additional metadata specific to the storage implementation */
  implementationMetadata?: Record<string, unknown>;
}

/**
 * Enhanced subscription interface that includes metadata.
 * Used internally by libraries for subscription management.
 */
export type ManagedSubscription<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = Subscription<S, L1, L2, L3, L4, L5> & {
  /** Metadata about this subscription's state */
  metadata: SubscriptionMetadata;
};

/**
 * Event handler function type.
 * Used for type-safe event callbacks.
 */
export type EventHandler<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = (event: BaseEvent<S, L1, L2, L3, L4, L5>) => void | Promise<void>;

/**
 * Event handler with error handling.
 * Allows handlers to indicate success/failure for better error tracking.
 */
export type SafeEventHandler<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = (event: BaseEvent<S, L1, L2, L3, L4, L5>) => Promise<{ success: boolean; error?: Error }>;

/**
 * Batch of events for efficient processing.
 * Used when multiple events need to be processed together.
 */
export interface EventBatch<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  /** Events in this batch */
  events: BaseEvent<S, L1, L2, L3, L4, L5>[];
  
  /** When this batch was created */
  createdAt: Date;
  
  /** Optional: transaction ID if these events are part of a transaction */
  transactionId?: string;
  
  /** Optional: batch metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Statistics about event processing.
 * Used for monitoring and performance analysis.
 */
export interface EventStats {
  /** Total events processed */
  totalEvents: number;
  
  /** Events processed by type */
  eventsByType: Record<string, number>;
  
  /** Events processed by scope */
  eventsByScope: Record<string, number>;
  
  /** Average event processing time in milliseconds */
  averageProcessingTime: number;
  
  /** Number of active subscriptions */
  activeSubscriptions: number;
  
  /** Number of failed event deliveries */
  failedDeliveries: number;
  
  /** When these stats were last updated */
  lastUpdated: Date;
}

/**
 * Configuration for event system behavior.
 * Used by libraries to customize event processing.
 */
export interface EventSystemConfig {
  /** Maximum number of events to batch together */
  maxBatchSize?: number;
  
  /** Maximum time to wait before processing a batch (milliseconds) */
  maxBatchWaitTime?: number;
  
  /** Maximum number of retry attempts for failed event deliveries */
  maxRetryAttempts?: number;
  
  /** Delay between retry attempts (milliseconds) */
  retryDelay?: number;
  
  /** Whether to enable event statistics collection */
  enableStats?: boolean;
  
  /** Maximum number of subscriptions to allow */
  maxSubscriptions?: number;
  
  /** Cleanup interval for inactive subscriptions (milliseconds) */
  subscriptionCleanupInterval?: number;
}

/**
 * Default configuration values.
 * Libraries can use these as defaults and override as needed.
 */
export const DEFAULT_EVENT_CONFIG: Required<EventSystemConfig> = {
  maxBatchSize: 100,
  maxBatchWaitTime: 50, // 50ms
  maxRetryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableStats: true,
  maxSubscriptions: 1000,
  subscriptionCleanupInterval: 300000, // 5 minutes
};

/**
 * Error types specific to the event system.
 * Used for better error handling and debugging.
 */
export class EventSystemError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'EventSystemError';
  }
}

export class SubscriptionError extends EventSystemError {
  constructor(message: string, public readonly subscriptionId: string, details?: Record<string, unknown>) {
    super(message, 'SUBSCRIPTION_ERROR', { subscriptionId, ...details });
    this.name = 'SubscriptionError';
  }
}

export class EventEmissionError extends EventSystemError {
  constructor(message: string, public readonly eventType: string, details?: Record<string, unknown>) {
    super(message, 'EVENT_EMISSION_ERROR', { eventType, ...details });
    this.name = 'EventEmissionError';
  }
}

export class EventMatchingError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EVENT_MATCHING_ERROR', details);
    this.name = 'EventMatchingError';
  }
}

/**
 * Utility function to create standardized error messages.
 */
export function createEventSystemError(
  type: 'subscription' | 'emission' | 'matching' | 'general',
  message: string,
  details?: Record<string, unknown>
): EventSystemError {
  switch (type) {
    case 'subscription':
      return new SubscriptionError(message, details?.subscriptionId as string || 'unknown', details);
    case 'emission':
      return new EventEmissionError(message, details?.eventType as string || 'unknown', details);
    case 'matching':
      return new EventMatchingError(message, details);
    case 'general':
    default:
      return new EventSystemError(message, 'GENERAL_ERROR', details);
  }
}

/**
 * Utility function to check if an error is an EventSystemError.
 */
export function isEventSystemError(error: unknown): error is EventSystemError {
  return error instanceof EventSystemError;
}

/**
 * Utility type for extracting the item type from an event.
 */
export type ExtractItemType<T> = T extends BaseEvent<infer S, any, any, any, any, any> ? S : never;

/**
 * Utility type for extracting all type parameters from an event.
 */
export type ExtractEventTypes<T> = T extends BaseEvent<infer S, infer L1, infer L2, infer L3, infer L4, infer L5>
  ? { S: S; L1: L1; L2: L2; L3: L3; L4: L4; L5: L5 }
  : never;

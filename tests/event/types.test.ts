import { describe, expect, it } from 'vitest';
import {
  createEventSystemError,
  DEFAULT_EVENT_CONFIG,
  EventSystemError,
  isEventSystemError,
  STANDARD_EVENT_TYPES,
  STANDARD_SCOPES,
  SubscriptionStatus,
} from '../../src/event/types';

describe('event/types utilities', () => {
  it('exports standard enums/constants', () => {
    expect(Object.values(STANDARD_EVENT_TYPES)).toContain('create');
    expect(Object.values(STANDARD_SCOPES)).toContain('firestore');
    expect(SubscriptionStatus.ACTIVE).toBe('active');
    expect(DEFAULT_EVENT_CONFIG.maxBatchSize).toBeGreaterThan(0);
  });

  it('creates typed EventSystemError variants', () => {
    const subErr = createEventSystemError('subscription', 'bad sub', { subscriptionId: 's1' });
    expect(subErr).toBeInstanceOf(EventSystemError);
    expect(isEventSystemError(subErr)).toBe(true);

    const emErr = createEventSystemError('emission', 'bad emit', { eventType: 'create' });
    expect(emErr).toBeInstanceOf(EventSystemError);
    expect(isEventSystemError(emErr)).toBe(true);

    const matchErr = createEventSystemError('matching', 'bad match');
    expect(matchErr).toBeInstanceOf(EventSystemError);

    const genErr = createEventSystemError('general', 'oops');
    expect(genErr).toBeInstanceOf(EventSystemError);
  });
});

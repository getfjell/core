import { describe, expect, it } from 'vitest';
import {
  compareLocationValues,
  doesEventMatchSubscription,
  doesEventTypeMatch,
  doesKeyMatch,
  doesKeyMatchLocation,
  doesLocationMatch,
  doesScopeMatch,
  extractLocationValues,
  findMatchingSubscriptions,
} from '../../src/event/matching';
import type { ComKey, ItemTypeArray, LocKeyArray, PriKey } from '../../src/keys';
import type { BaseEvent } from '../../src/event/events';
import type { Subscription } from '../../src/event/subscription';

// Helpers to build keys
const priKey = (pk: string): PriKey<'product'> => ({ kt: 'product', pk });
const comKey = (pk: string, loc: Array<{ kt: 'store' | 'region'; lk: string }>): ComKey<'product', 'store', 'region'> => ({ kt: 'product', pk, loc });

// Common KTA variants
const ktaRoot: ItemTypeArray<'product'> = ['product'];
const ktaWithLoc: ItemTypeArray<'product', 'store', 'region'> = ['product', 'store', 'region'];
// Some matching logic expects the target item type to be the last entry in KTA.
// Provide an alternative KTA with 'product' as the last element for those cases.
// Cast to any to satisfy the runtime behavior under test.
const ktaTailProduct = ['store', 'region', 'product'] as unknown as ItemTypeArray<'product', 'store', 'region'>;

// Common locations
const storeOnly: LocKeyArray<'store', 'region'> = [{ kt: 'store', lk: 's1' }];
const storeRegion: LocKeyArray<'store', 'region'> = [
  { kt: 'store', lk: 's1' },
  { kt: 'region', lk: 'r9' },
];

// Event builders
const mkEvent = (
  key: PriKey<'product'> | ComKey<'product', 'store', 'region'>,
  eventType: 'create' | 'update' | 'delete' | 'action' = 'create',
  scopes: string[] = ['test']
): BaseEvent<'product', 'store', 'region'> => ({
  eventType,
  key,
  scopes,
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
});

// Subscription builders
const itemSub = (key: PriKey<'product'> | ComKey<'product', 'store', 'region'>, eventTypes?: string[], scopes?: string[]): Subscription<'product', 'store', 'region'> => ({
  id: 'sub-1',
  key,
  eventTypes,
  scopes,
});
const locSub = (
  kta: ItemTypeArray<'product', 'store', 'region'> | ItemTypeArray<'product'>,
  location: LocKeyArray<'store', 'region'>,
  eventTypes?: string[],
  scopes?: string[]
): Subscription<'product', 'store', 'region'> => ({
  id: 'sub-2',
  kta: kta as any,
  location,
  eventTypes,
  scopes,
});

describe('event/matching', () => {
  describe('doesScopeMatch', () => {
    it('accepts when subscription has no scopes', () => {
      expect(doesScopeMatch(['a', 'b'])).toBe(true);
    });
    it('accepts when any required scope is present', () => {
      expect(doesScopeMatch(['a', 'b'], ['x', 'b'])).toBe(true);
    });
    it('rejects when no required scopes present', () => {
      expect(doesScopeMatch(['a'], ['x', 'y'])).toBe(false);
    });
  });

  describe('doesEventTypeMatch', () => {
    it('accepts when subscription has no event types', () => {
      expect(doesEventTypeMatch('create')).toBe(true);
    });
    it('accepts when event type listed', () => {
      expect(doesEventTypeMatch('create', ['update', 'create'])).toBe(true);
    });
    it('rejects when event type not listed', () => {
      expect(doesEventTypeMatch('delete', ['update', 'create'])).toBe(false);
    });
  });

  describe('doesKeyMatch', () => {
    it('matches identical PriKeys', () => {
      const a = priKey('p1');
      const b = priKey('p1');
      expect(doesKeyMatch(a, b)).toBe(true);
    });
    it('rejects different PriKeys', () => {
      expect(doesKeyMatch(priKey('p1'), priKey('p2'))).toBe(false);
    });
    it('matches identical ComKeys', () => {
      const a = comKey('p1', [{ kt: 'store', lk: 's1' }]);
      const b = comKey('p1', [{ kt: 'store', lk: 's1' }]);
      expect(doesKeyMatch(a, b)).toBe(true);
    });
    it('rejects ComKeys with different loc length', () => {
      const a = comKey('p1', [{ kt: 'store', lk: 's1' }]);
      const b = comKey('p1', [
        { kt: 'store', lk: 's1' },
        { kt: 'region', lk: 'r9' },
      ]);
      expect(doesKeyMatch(a, b)).toBe(false);
    });
    it('rejects ComKeys with different location keys', () => {
      const a = comKey('p1', [{ kt: 'store', lk: 's1' }]);
      const b = comKey('p1', [{ kt: 'store', lk: 's2' }]);
      expect(!doesKeyMatch(a, b)).toBe(true);
    });
    it('rejects when types differ (PriKey vs ComKey)', () => {
      expect(doesKeyMatch(priKey('p1'), comKey('p1', []))).toBe(false);
    });
  });

  describe('doesKeyMatchLocation', () => {
    it('PriKey matches only empty subscription location', () => {
      expect(doesKeyMatchLocation(priKey('p1'), ktaRoot as any, [])).toBe(true);
      expect(doesKeyMatchLocation(priKey('p1'), ktaWithLoc, storeOnly)).toBe(false);
    });
    it('ComKey matches empty subscription location when item type is last in KTA', () => {
      const key = comKey('p1', [{ kt: 'store', lk: 's1' }]);
      expect(doesKeyMatchLocation(key, ktaTailProduct, [])).toBe(true);
    });
    it('ComKey matches exact prefix of location when item type is last in KTA', () => {
      const key = comKey('p1', storeRegion);
      expect(doesKeyMatchLocation(key, ktaTailProduct, storeOnly)).toBe(true);
      expect(doesKeyMatchLocation(key, ktaTailProduct, storeRegion)).toBe(true);
    });
    it('ComKey rejects when subscription location deeper than event', () => {
      const key = comKey('p1', storeOnly);
      expect(doesKeyMatchLocation(key, ktaWithLoc, storeRegion)).toBe(false);
    });
  });

  describe('doesLocationMatch', () => {
    it('accepts empty subscription location', () => {
      expect(doesLocationMatch(storeOnly, [], ktaWithLoc)).toBe(true);
    });
    it('rejects when event location shorter than subscription', () => {
      expect(doesLocationMatch(storeOnly, storeRegion, ktaWithLoc)).toBe(false);
    });
    it('matches identical locations', () => {
      expect(doesLocationMatch(storeRegion, storeRegion, ktaWithLoc)).toBe(true);
    });
    it('rejects different values', () => {
      const other: LocKeyArray<'store', 'region'> = [
        { kt: 'store', lk: 's2' },
        { kt: 'region', lk: 'r9' },
      ];
      expect(doesLocationMatch(storeRegion, other, ktaWithLoc)).toBe(false);
    });
  });

  describe('findMatchingSubscriptions and utilities', () => {
    it('filters only matching subscriptions', () => {
      const event = mkEvent(comKey('p1', storeOnly), 'update', ['alpha']);
      const subs: Subscription<'product', 'store', 'region'>[] = [
        itemSub(comKey('p1', storeOnly), ['update'], ['alpha']), // match
        itemSub(comKey('p1', storeOnly), ['create'], ['alpha']), // event type mismatch
        itemSub(comKey('x', storeOnly), ['update'], ['alpha']), // key mismatch
        locSub(ktaTailProduct, storeOnly, ['update'], ['alpha']), // match by location
        locSub(ktaWithLoc, storeOnly, ['update'], ['beta']), // scope mismatch
      ];

      const matches = findMatchingSubscriptions(event, subs);
      expect(matches.length).toBe(2);
      // Contains the item and location subscription from above
      expect(matches.some(s => 'key' in s)).toBe(true);
      expect(matches.some(s => 'location' in s)).toBe(true);
    });

    it('extracts and compares location values', () => {
      expect(extractLocationValues(storeOnly)).toEqual(['s1']);
      expect(compareLocationValues(storeOnly, [{ kt: 'store', lk: 's1' }])).toBe(true);
      expect(compareLocationValues(storeOnly, [{ kt: 'store', lk: 's2' }])).toBe(false);
    });

    it('doesEventMatchSubscription integrates checks', () => {
      const event = mkEvent(priKey('p1'), 'create', ['alpha']);
      const sub = itemSub(priKey('p1'), ['create'], ['alpha']);
      expect(doesEventMatchSubscription(event, sub)).toBe(true);
    });
  });
});

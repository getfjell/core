import { describe, expect, it } from 'vitest';
import {
  createItemSubscription,
  createLocationSubscription,
  generateSubscriptionId,
  isItemSubscription,
  isLocationSubscription,
} from '../../src/event/subscription';

import type { ItemTypeArray, LocKeyArray, PriKey } from '../../src/keys';

describe('event/subscription', () => {
  it('type guards distinguish subscription shapes', () => {
    const itemKey: PriKey<'product'> = { kt: 'product', pk: 'p1' };
    const itemSub = createItemSubscription(itemKey, { eventTypes: ['create'], scopes: ['alpha'] });
    expect(isItemSubscription(itemSub)).toBe(true);
    expect(isLocationSubscription(itemSub as any)).toBe(false);

    const kta: ItemTypeArray<'product', 'store'> = ['product', 'store'];
    const loc: LocKeyArray<'store'> = [{ kt: 'store', lk: 's1' }];
    const locSub = createLocationSubscription(kta, loc, { eventTypes: ['update'], scopes: ['beta'] });
    expect(isLocationSubscription(locSub)).toBe(true);
    expect(isItemSubscription(locSub as any)).toBe(false);
  });

  it('create*Subscription generates id and carries options', () => {
    const id = generateSubscriptionId();
    expect(id).toMatch(/^sub-/);

    const itemKey: PriKey<'product'> = { kt: 'product', pk: 'p1' };
    const sub = createItemSubscription(itemKey, { eventTypes: ['create'], scopes: ['alpha'] });
    expect(sub.id).toMatch(/^sub-/);
    expect(sub.eventTypes).toEqual(['create']);
    expect(sub.scopes).toEqual(['alpha']);
  });
});

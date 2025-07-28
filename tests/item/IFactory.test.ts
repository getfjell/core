import { IFactory } from '../../src/item/IFactory';
import { Item } from '../../src/items';
import { PriKey } from '../../src/keys';
import { describe, expect, test } from 'vitest';

describe('Testing IFactory', () => {
  const nowDate = new Date();
  const profileKey: PriKey<'profile'> = { kt: 'profile', pk: '1-1-1-1-1' };
  const profile: Item<'profile'> = {
    key: profileKey,
    events: {
      created: { at: nowDate },
      updated: { at: nowDate },
      deleted: { at: null }
    },
    name: 'hello'
  };

  test('Event with a Profile and a Date', () => {
    const iFactory = IFactory.addEvent('tested', nowDate, profileKey);
    const expected = { events: { tested: { at: nowDate, by: profileKey } } }
    expect(iFactory.toItem()).toStrictEqual(expected);
  });

  test('Event with an unnamed Reference', () => {
    const iFactory = IFactory.addRef(profile);
    const expected = { refs: { profile: { kt: 'profile', pk: '1-1-1-1-1' } } }
    expect(iFactory.toItem()).toStrictEqual(expected);
  });

  test('Event with a named Reference', () => {
    const iFactory = IFactory.addRef(profile, 'creator');
    const expected = { refs: { creator: { kt: 'profile', pk: '1-1-1-1-1' } } }
    expect(iFactory.toItem()).toStrictEqual(expected);
  });

  test('Item created with a constructor, add default events, test for default events', () => {
    const iFactory = new IFactory({ test: true });
    iFactory.addDefaultEvents();
    const newDate = iFactory.toItem().events.created.at;
    const expected = {
      test: true,
      events: {
        created: { at: newDate },
        updated: { at: newDate },
        deleted: { at: null }
      }
    };
    expect(iFactory.toItem()).toStrictEqual(expected);
  });

  test('Add prop to an item', () => {
    const iFactory = IFactory.addProp('whatever', true);
    const expected = { whatever: true };
    expect(iFactory.toItem()).toStrictEqual(expected);
  });

  test('Add props to an item', () => {
    const iFactory = IFactory.addProps({ whatever: true });
    const expected = { whatever: true };
    expect(iFactory.toItem()).toStrictEqual(expected);
  });
});
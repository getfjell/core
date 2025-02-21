import { IFactory } from '@/item/IFactory';
import { Item } from '@/items';
import { PriKey } from '@/keys';

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});

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
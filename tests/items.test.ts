import { describe, expect, it } from 'vitest';
import {
  Deletable,
  Evented,
  Identified,
  Item,
  ItemEvent,
  ItemProperties,
  ManagedEvents,
  Propertied,
  RecursivePartial,
  ReferenceItem,
  ReferenceItems,
  References,
  RequiredItemEvent,
  Timestamped
} from '../src/items';
import { ComKey, LocKey, PriKey } from '../src/keys';

describe('items.ts types', () => {
  it('should allow for RecursivePartial', () => {
        interface ComplexObject {
            a: string;
            b: number;
            c: {
                d: boolean;
                e: string[];
                f: { g: number };
            };
        }

        const partial: RecursivePartial<ComplexObject> = {
          a: 'test',
          c: {
            e: ['one', 'two'],
            f: {},
          },
        };

        expect(partial.a).toBe('test');
        expect(partial.c?.e).toEqual(['one', 'two']);
        expect(partial).toBeDefined();
  });

  it('should correctly type Identified', () => {
    const priKey: PriKey<'MyType'> = { kt: 'MyType', pk: 'id1' };
    const locKey: LocKey<'L1'> = { kt: 'L1', lk: 'loc1' };
    const comKey: ComKey<'MyType', 'L1'> = { kt: 'MyType', pk: 'id2', loc: [locKey] };

    const identifiedWithPriKey: Identified<'MyType'> = {
      key: priKey,
    };
    expect(identifiedWithPriKey.key).toBe(priKey);

    const identifiedWithComKey: Identified<'MyType', 'L1'> = {
      key: comKey,
    };
    expect(identifiedWithComKey.key).toBe(comKey);
  });

  it('should correctly type Propertied', () => {
    const prop: Propertied = {
      name: 'test',
      value: 123,
    };
    expect(prop.name).toBe('test');
  });

  it('should correctly type ItemEvent', () => {
    const event: ItemEvent = {
      at: new Date(),
    };
    expect(event.at).toBeInstanceOf(Date);
    const nullEvent: ItemEvent = {
      at: null,
    };
    expect(nullEvent.at).toBeNull();
  });

  it('should correctly type RequiredItemEvent', () => {
    const event: RequiredItemEvent = {
      at: new Date(),
    };
    expect(event.at).toBeInstanceOf(Date);
  });

  it('should correctly type Evented', () => {
    const events: Evented = {
      custom: { at: new Date() },
    };
    expect(events.custom.at).toBeInstanceOf(Date);
  });

  it('should correctly type Timestamped', () => {
    const timestamps: Timestamped = {
      created: { at: new Date() },
      updated: { at: new Date() },
    };
    expect(timestamps.created.at).toBeInstanceOf(Date);
    expect(timestamps.updated.at).toBeInstanceOf(Date);
  });

  it('should correctly type Deletable', () => {
    const deletable: Deletable = {
      deleted: { at: null },
    };
    expect(deletable.deleted.at).toBeNull();
  });

  it('should correctly type ManagedEvents', () => {
    const managed: ManagedEvents = {
      created: { at: new Date() },
      updated: { at: new Date() },
      deleted: { at: null },
    };
    expect(managed.created).toBeDefined();
    expect(managed.updated).toBeDefined();
    expect(managed.deleted).toBeDefined();
  });

  it('should correctly type Item, ItemProperties, References, ReferenceItem, and ReferenceItems', () => {
    const userKey: PriKey<'User'> = { kt: 'User', pk: 'user1' };
    const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role1' };

    const roleItem: Item<'Role'> = {
      key: roleKey,
      events: {
        created: { at: new Date() },
        updated: { at: new Date() },
        deleted: { at: null },
      },
      name: 'Admin'
    };

    const refItem: ReferenceItem<'Role'> = {
      key: roleKey,
      item: roleItem
    };

    const refs: References = {
      primaryRole: roleKey,
    };

    const refItems: ReferenceItems = {
      primaryRole: refItem,
    };

    const userItem: Item<'User'> = {
      key: userKey,
      events: {
        created: { at: new Date() },
        updated: { at: new Date() },
        deleted: { at: null },
        lastLogin: { at: new Date() },
      },
      name: 'John Doe',
      refs: refs,
      aggs: refItems,
    };

    expect(userItem.key).toBe(userKey);
    expect(userItem.name).toBe('John Doe');
    expect(userItem.events.lastLogin?.at).toBeInstanceOf(Date);
    expect(userItem.refs?.primaryRole).toBe(roleKey);
    expect(userItem.aggs?.primaryRole.item.name).toBe('Admin');

    const userProps: ItemProperties<'User'> = {
      name: 'Jane Doe',
      events: {
        lastLogin: { at: new Date() },
      }
    };
    expect(userProps.name).toBe('Jane Doe');
  });
});

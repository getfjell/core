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
  Timestamped,
  TypesProperties
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

describe('items.ts runtime behavior', () => {
  describe('RecursivePartial utility type', () => {
    it('should handle deeply nested partial objects', () => {
      interface DeepNested {
        level1: {
          level2: {
            level3: {
              value: string;
              array: number[];
            };
          };
        };
      }

      const partial: RecursivePartial<DeepNested> = {
        level1: {
          level2: {
            level3: {
              value: 'test',
              array: [1, 2, 3]
            }
          }
        }
      };

      expect(partial.level1?.level2?.level3?.value).toBe('test');
      expect(partial.level1?.level2?.level3?.array).toEqual([1, 2, 3]);
    });

    it('should handle arrays in RecursivePartial', () => {
      interface ArrayObject {
        items: Array<{
          id: string;
          metadata: {
            tags: string[];
          };
        }>;
      }

      const partial: RecursivePartial<ArrayObject> = {
        items: [
          {
            id: 'item1',
            metadata: {
              tags: ['tag1', 'tag2']
            }
          }
        ]
      };

      expect(partial.items?.[0]?.id).toBe('item1');
      expect(partial.items?.[0]?.metadata?.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle optional properties correctly', () => {
      interface WithOptionals {
        required: string;
        optional?: {
          nested: string;
        };
      }

      const partial: RecursivePartial<WithOptionals> = {
        required: 'test'
      };

      expect(partial.required).toBe('test');
      expect(partial.optional).toBeUndefined();
    });
  });

  describe('Identified interface', () => {
    it('should work with different key types', () => {
      const priKey: PriKey<'Product'> = { kt: 'Product', pk: 'prod-123' };
      const locKey: LocKey<'Warehouse'> = { kt: 'Warehouse', lk: 'wh-001' };
      const comKey: ComKey<'Product', 'Warehouse'> = {
        kt: 'Product',
        pk: 'prod-456',
        loc: [locKey]
      };

      const identified1: Identified<'Product'> = { key: priKey };
      const identified2: Identified<'Product', 'Warehouse'> = { key: comKey };

      expect(identified1.key).toBe(priKey);
      expect(identified2.key).toBe(comKey);
      expect(identified1.key.kt).toBe('Product');
      expect(identified2.key.kt).toBe('Product');
    });

    it('should support complex location hierarchies', () => {
      const loc1: LocKey<'Country'> = { kt: 'Country', lk: 'US' };
      const loc2: LocKey<'State'> = { kt: 'State', lk: 'CA' };
      const loc3: LocKey<'City'> = { kt: 'City', lk: 'SF' };
      
      const comKey: ComKey<'Store', 'Country', 'State', 'City'> = {
        kt: 'Store',
        pk: 'store-001',
        loc: [loc1, loc2, loc3]
      };

      const identified: Identified<'Store', 'Country', 'State', 'City'> = { key: comKey };
      
      // Type assertion to ComKey since we know it's a ComKey in this test
      const key = identified.key as ComKey<'Store', 'Country', 'State', 'City'>;
      expect(key.loc).toHaveLength(3);
      expect(key.loc[0].kt).toBe('Country');
      expect(key.loc[1].kt).toBe('State');
      expect(key.loc[2].kt).toBe('City');
    });
  });

  describe('ItemEvent interface', () => {
    it('should support events with by field', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const event: ItemEvent = {
        at: new Date('2023-01-01'),
        by: userKey
      };

      expect(event.at).toEqual(new Date('2023-01-01'));
      expect(event.by).toBe(userKey);
      expect(event.by?.kt).toBe('User');
    });

    it('should support events with agg field', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Test User'
      };

      const event: ItemEvent = {
        at: new Date('2023-01-01'),
        agg: userItem
      };

      expect(event.at).toEqual(new Date('2023-01-01'));
      expect(event.agg).toBe(userItem);
      expect(event.agg?.name).toBe('Test User');
    });

    it('should support events with all fields', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const adminKey: PriKey<'User'> = { kt: 'User', pk: 'admin-456' };
      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Test User'
      };

      const event: ItemEvent = {
        at: new Date('2023-01-01'),
        by: adminKey,
        agg: userItem
      };

      expect(event.at).toEqual(new Date('2023-01-01'));
      expect(event.by).toBe(adminKey);
      expect(event.agg).toBe(userItem);
    });
  });

  describe('RequiredItemEvent interface', () => {
    it('should enforce required at field', () => {
      const event: RequiredItemEvent = {
        at: new Date('2023-01-01')
      };

      expect(event.at).toEqual(new Date('2023-01-01'));
      expect(event.at).toBeInstanceOf(Date);
    });

    it('should extend ItemEvent correctly', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const event: RequiredItemEvent = {
        at: new Date('2023-01-01'),
        by: userKey
      };

      expect(event.at).toEqual(new Date('2023-01-01'));
      expect(event.by).toBe(userKey);
    });
  });

  describe('Evented type', () => {
    it('should support custom event types', () => {
      const events: Evented = {
        login: { at: new Date('2023-01-01') },
        logout: { at: new Date('2023-01-02') },
        passwordChange: { at: new Date('2023-01-03') }
      };

      expect(events.login.at).toEqual(new Date('2023-01-01'));
      expect(events.logout.at).toEqual(new Date('2023-01-02'));
      expect(events.passwordChange.at).toEqual(new Date('2023-01-03'));
    });

    it('should support events with by and agg fields', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const events: Evented = {
        custom: {
          at: new Date('2023-01-01'),
          by: userKey
        }
      };

      expect(events.custom.at).toEqual(new Date('2023-01-01'));
      expect(events.custom.by).toBe(userKey);
    });
  });

  describe('Timestamped interface', () => {
    it('should enforce required created and updated events', () => {
      const now = new Date();
      const timestamps: Timestamped = {
        created: { at: now },
        updated: { at: now }
      };

      expect(timestamps.created.at).toBe(now);
      expect(timestamps.updated.at).toBe(now);
      expect(timestamps.created.at).toBeInstanceOf(Date);
      expect(timestamps.updated.at).toBeInstanceOf(Date);
    });

    it('should support additional custom events', () => {
      const now = new Date();
      const timestamps: Timestamped = {
        created: { at: now },
        updated: { at: now },
        lastAccessed: { at: now }
      };

      expect(timestamps.created.at).toBe(now);
      expect(timestamps.updated.at).toBe(now);
      expect(timestamps.lastAccessed?.at).toBe(now);
    });
  });

  describe('Deletable interface', () => {
    it('should support deleted event', () => {
      const deletable: Deletable = {
        deleted: { at: new Date('2023-01-01') }
      };

      expect(deletable.deleted.at).toEqual(new Date('2023-01-01'));
    });

    it('should support deleted event with null at', () => {
      const deletable: Deletable = {
        deleted: { at: null }
      };

      expect(deletable.deleted.at).toBeNull();
    });

    it('should support additional events', () => {
      const deletable: Deletable = {
        deleted: { at: new Date('2023-01-01') },
        restored: { at: new Date('2023-01-02') }
      };

      expect(deletable.deleted.at).toEqual(new Date('2023-01-01'));
      expect(deletable.restored?.at).toEqual(new Date('2023-01-02'));
    });
  });

  describe('ManagedEvents type', () => {
    it('should combine Timestamped and Deletable', () => {
      const now = new Date();
      const managed: ManagedEvents = {
        created: { at: now },
        updated: { at: now },
        deleted: { at: null }
      };

      expect(managed.created.at).toBe(now);
      expect(managed.updated.at).toBe(now);
      expect(managed.deleted.at).toBeNull();
    });

    it('should support additional custom events', () => {
      const now = new Date();
      const managed: ManagedEvents = {
        created: { at: now },
        updated: { at: now },
        deleted: { at: null },
        archived: { at: now }
      };

      expect(managed.created.at).toBe(now);
      expect(managed.updated.at).toBe(now);
      expect(managed.deleted.at).toBeNull();
      expect(managed.archived?.at).toBe(now);
    });
  });

  describe('References type', () => {
    it('should support different key types', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };
      const locKey: LocKey<'Location'> = { kt: 'Location', lk: 'loc-789' };
      const comKey: ComKey<'Product', 'Location'> = {
        kt: 'Product',
        pk: 'prod-123',
        loc: [locKey]
      };

      const refs: References = {
        owner: userKey,
        role: roleKey,
        location: comKey
      };

      expect(refs.owner).toBe(userKey);
      expect(refs.role).toBe(roleKey);
      expect(refs.location).toBe(comKey);
    });
  });

  describe('ReferenceItem type', () => {
    it('should support different item types', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };

      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe'
      };

      const roleItem: Item<'Role'> = {
        key: roleKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Admin'
      };

      const userRef: ReferenceItem<'User'> = {
        key: userKey,
        item: userItem
      };

      const roleRef: ReferenceItem<'Role'> = {
        key: roleKey,
        item: roleItem
      };

      expect(userRef.key).toBe(userKey);
      expect(userRef.item).toBe(userItem);
      expect(roleRef.key).toBe(roleKey);
      expect(roleRef.item).toBe(roleItem);
    });
  });

  describe('ReferenceItems type', () => {
    it('should support multiple reference items', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };

      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe'
      };

      const roleItem: Item<'Role'> = {
        key: roleKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Admin'
      };

      const refItems: ReferenceItems = {
        user: { key: userKey, item: userItem },
        role: { key: roleKey, item: roleItem }
      };

      expect(refItems.user.key).toBe(userKey);
      expect(refItems.user.item).toBe(userItem);
      expect(refItems.role.key).toBe(roleKey);
      expect(refItems.role.item).toBe(roleItem);
    });
  });

  describe('Item interface', () => {
    it('should support basic item structure', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      expect(userItem.key).toBe(userKey);
      expect(userItem.name).toBe('John Doe');
      expect(userItem.email).toBe('john@example.com');
      expect(userItem.age).toBe(30);
      expect(userItem.events.created.at).toBeInstanceOf(Date);
    });

    it('should support references and aggregations', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };

      const roleItem: Item<'Role'> = {
        key: roleKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Admin'
      };

      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe',
        refs: {
          role: roleKey
        },
        aggs: {
          role: { key: roleKey, item: roleItem }
        }
      };

      expect(userItem.refs?.role).toBe(roleKey);
      expect(userItem.aggs?.role.item).toBe(roleItem);
      expect(userItem.aggs?.role.item.name).toBe('Admin');
    });

    it('should support dynamic properties', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe'
      };

      // Add dynamic properties
      (userItem as any).customField = 'custom value';
      (userItem as any).metadata = { tags: ['tag1', 'tag2'] };

      expect((userItem as any).customField).toBe('custom value');
      expect((userItem as any).metadata.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('Propertied interface', () => {
    it('should support basic properties', () => {
      const prop: Propertied = {
        name: 'score',
        value: 95
      };

      expect(prop.name).toBe('score');
      expect(prop.value).toBe(95);
    });

    it('should support different property types', () => {
      const props: Propertied[] = [
        { name: 'strength', value: 80 },
        { name: 'agility', value: 90 },
        { name: 'intelligence', value: 85 }
      ];

      expect(props).toHaveLength(3);
      expect(props[0].name).toBe('strength');
      expect(props[0].value).toBe(80);
    });
  });

  describe('ItemProperties type', () => {
    it('should support partial item properties without key', () => {
      const userProps: ItemProperties<'User'> = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      expect(userProps.name).toBe('Jane Doe');
      expect(userProps.email).toBe('jane@example.com');
      expect(userProps.key).toBeUndefined();
    });

    it('should support partial events', () => {
      const userProps: ItemProperties<'User'> = {
        events: {
          lastLogin: { at: new Date() }
        }
      };

      expect(userProps.events?.lastLogin?.at).toBeInstanceOf(Date);
    });
  });

  describe('TypesProperties type', () => {
    it('should be equivalent to ItemProperties', () => {
      const userProps1: ItemProperties<'User'> = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const userProps2: TypesProperties<'User'> = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      expect(userProps1.name).toBe(userProps2.name);
      expect(userProps1.email).toBe(userProps2.email);
    });

    it('should support all property types', () => {
      const userProps: TypesProperties<'User'> = {
        name: 'John Doe',
        email: 'john@example.com',
        events: {
          lastLogin: { at: new Date() }
        },
        refs: {
          role: { kt: 'Role', pk: 'role-123' }
        }
      };

      expect(userProps.name).toBe('John Doe');
      expect(userProps.email).toBe('john@example.com');
      expect(userProps.events?.lastLogin?.at).toBeInstanceOf(Date);
      expect(userProps.refs?.role.kt).toBe('Role');
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle complex nested RecursivePartial with arrays and objects', () => {
      interface ComplexNested {
        users: Array<{
          profile: {
            personal: {
              name: string;
              addresses: Array<{
                street: string;
                city: string;
                country: string;
              }>;
            };
            preferences: {
              theme: string;
              notifications: boolean;
            };
          };
          roles: string[];
        }>;
        metadata: {
          version: string;
          config: Record<string, any>;
        };
      }

      const partial: RecursivePartial<ComplexNested> = {
        users: [
          {
            profile: {
              personal: {
                name: 'John Doe',
                addresses: [
                  { street: '123 Main St', city: 'Anytown', country: 'USA' }
                ]
              },
              preferences: {
                theme: 'dark'
              }
            },
            roles: ['user', 'admin']
          }
        ],
        metadata: {
          version: '1.0.0'
        }
      };

      expect(partial.users?.[0]?.profile?.personal?.name).toBe('John Doe');
      expect(partial.users?.[0]?.profile?.personal?.addresses?.[0]?.city).toBe('Anytown');
      expect(partial.users?.[0]?.profile?.preferences?.theme).toBe('dark');
      expect(partial.users?.[0]?.profile?.preferences?.notifications).toBeUndefined();
      expect(partial.users?.[0]?.roles).toEqual(['user', 'admin']);
      expect(partial.metadata?.version).toBe('1.0.0');
      expect(partial.metadata?.config).toBeUndefined();
    });

    it('should handle Identified with maximum location hierarchy', () => {
      const loc1: LocKey<'L1'> = { kt: 'L1', lk: 'loc1' };
      const loc2: LocKey<'L2'> = { kt: 'L2', lk: 'loc2' };
      const loc3: LocKey<'L3'> = { kt: 'L3', lk: 'loc3' };
      const loc4: LocKey<'L4'> = { kt: 'L4', lk: 'loc4' };
      const loc5: LocKey<'L5'> = { kt: 'L5', lk: 'loc5' };

      const comKey: ComKey<'Test', 'L1', 'L2', 'L3', 'L4', 'L5'> = {
        kt: 'Test',
        pk: 'test-123',
        loc: [loc1, loc2, loc3, loc4, loc5]
      };

      const identified: Identified<'Test', 'L1', 'L2', 'L3', 'L4', 'L5'> = { key: comKey };

      // Type assertion to ComKey since we know it's a ComKey in this test
      const key = identified.key as ComKey<'Test', 'L1', 'L2', 'L3', 'L4', 'L5'>;
      expect(key.loc).toHaveLength(5);
      expect(key.loc[0].kt).toBe('L1');
      expect(key.loc[4].kt).toBe('L5');
    });

    it('should handle Item with complex event structures', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const adminKey: PriKey<'User'> = { kt: 'User', pk: 'admin-456' };

      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date('2023-01-01'), by: adminKey },
          updated: { at: new Date('2023-01-02'), by: adminKey },
          deleted: { at: null },
          lastLogin: { at: new Date('2023-01-03'), by: userKey },
          passwordChange: { at: new Date('2023-01-04'), by: userKey },
          profileUpdate: { at: new Date('2023-01-05'), by: userKey }
        },
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC'
        }
      };

      expect(userItem.events.created.by).toBe(adminKey);
      expect(userItem.events.lastLogin.by).toBe(userKey);
      expect(userItem.preferences.theme).toBe('dark');
      expect(userItem.isActive).toBe(true);
    });

    it('should handle Item with dynamic property access', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe'
      };

      // Test dynamic property access
      const dynamicProps = ['name', 'email', 'age', 'createdAt'];
      const results = dynamicProps.map(prop => (userItem as any)[prop]);

      expect(results[0]).toBe('John Doe'); // name
      expect(results[1]).toBeUndefined(); // email (not set)
      expect(results[2]).toBeUndefined(); // age (not set)
      expect(results[3]).toBeUndefined(); // createdAt (not set)
    });

    it('should handle complex References with mixed key types', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };
      const locKey: LocKey<'Location'> = { kt: 'Location', lk: 'loc-789' };
      const comKey: ComKey<'Product', 'Location'> = {
        kt: 'Product',
        pk: 'prod-123',
        loc: [locKey]
      };

      const refs: References = {
        owner: userKey,
        role: roleKey,
        location: comKey,
        manager: userKey,
        department: comKey
      };

      // Test accessing all reference types
      expect(refs.owner.kt).toBe('User');
      expect(refs.role.kt).toBe('Role');
      expect(refs.location.kt).toBe('Product');
      expect(refs.manager.kt).toBe('User');
      expect(refs.department.kt).toBe('Product');

      // Test that we can iterate over references
      const refKeys = Object.keys(refs);
      expect(refKeys).toContain('owner');
      expect(refKeys).toContain('role');
      expect(refKeys).toContain('location');
      expect(refKeys).toContain('manager');
      expect(refKeys).toContain('department');
    });

    it('should handle ReferenceItems with complex item structures', () => {
      const userKey: PriKey<'User'> = { kt: 'User', pk: 'user-123' };
      const roleKey: PriKey<'Role'> = { kt: 'Role', pk: 'role-456' };

      const userItem: Item<'User'> = {
        key: userKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
          bio: 'Software Developer',
          skills: ['TypeScript', 'React', 'Node.js']
        }
      };

      const roleItem: Item<'Role'> = {
        key: roleKey,
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        },
        name: 'Admin',
        permissions: ['read', 'write', 'delete'],
        level: 5
      };

      const refItems: ReferenceItems = {
        user: { key: userKey, item: userItem },
        role: { key: roleKey, item: roleItem }
      };

      // Test accessing nested properties through references
      expect(refItems.user.item.profile.bio).toBe('Software Developer');
      expect(refItems.user.item.profile.skills).toContain('TypeScript');
      expect(refItems.role.item.permissions).toContain('write');
      expect(refItems.role.item.level).toBe(5);

      // Test that we can iterate over reference items
      const refItemKeys = Object.keys(refItems);
      expect(refItemKeys).toContain('user');
      expect(refItemKeys).toContain('role');
    });

    it('should handle Propertied with various value types', () => {
      const props: Propertied[] = [
        { name: 'strength', value: 80 },
        { name: 'agility', value: 90 },
        { name: 'intelligence', value: 85 },
        { name: 'charisma', value: 75 },
        { name: 'constitution', value: 88 }
      ];

      // Test array operations
      expect(props.length).toBe(5);
      expect(props.map(p => p.name)).toEqual(['strength', 'agility', 'intelligence', 'charisma', 'constitution']);
      expect(props.map(p => p.value)).toEqual([80, 90, 85, 75, 88]);

      // Test finding specific properties
      const strengthProp = props.find(p => p.name === 'strength');
      expect(strengthProp?.value).toBe(80);

      // Test filtering
      const highStats = props.filter(p => p.value >= 85);
      expect(highStats).toHaveLength(3);
      expect(highStats.map(p => p.name)).toEqual(['agility', 'intelligence', 'constitution']);
    });

    it('should handle ItemProperties with complex nested structures', () => {
      const userProps: ItemProperties<'User'> = {
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
          bio: 'Software Developer',
          skills: ['TypeScript', 'React', 'Node.js'],
          experience: {
            years: 5,
            companies: ['Company A', 'Company B']
          }
        },
        preferences: {
          theme: 'dark',
          notifications: true,
          privacy: {
            shareProfile: false,
            allowContact: true
          }
        },
        events: {
          lastLogin: { at: new Date('2023-01-01') },
          profileUpdate: { at: new Date('2023-01-02') }
        }
      };

      expect(userProps.name).toBe('John Doe');
      expect(userProps.profile?.skills).toContain('TypeScript');
      expect(userProps.profile?.experience?.years).toBe(5);
      expect(userProps.preferences?.privacy?.shareProfile).toBe(false);
      expect(userProps.events?.lastLogin?.at).toEqual(new Date('2023-01-01'));
    });

    it('should handle TypesProperties with all possible property types', () => {
      const userProps: TypesProperties<'User'> = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        metadata: {
          tags: ['developer', 'typescript'],
          score: 95.5,
          flags: {
            verified: true,
            premium: false
          }
        },
        events: {
          created: { at: new Date('2023-01-01') },
          updated: { at: new Date('2023-01-02') },
          deleted: { at: null }
        },
        refs: {
          role: { kt: 'Role', pk: 'role-123' },
          team: { kt: 'Team', pk: 'team-456' }
        },
        aggs: {
          projects: { key: { kt: 'Project', pk: 'proj-789' }, item: {} as any }
        }
      };

      // Test primitive properties
      expect(userProps.name).toBe('John Doe');
      expect(userProps.age).toBe(30);
      expect(userProps.isActive).toBe(true);

      // Test nested object properties
      expect(userProps.metadata?.tags).toContain('typescript');
      expect(userProps.metadata?.flags?.verified).toBe(true);

      // Test event properties
      expect(userProps.events?.created?.at).toEqual(new Date('2023-01-01'));
      expect(userProps.events?.deleted?.at).toBeNull();

      // Test reference properties
      expect(userProps.refs?.role.kt).toBe('Role');
      expect(userProps.refs?.team.pk).toBe('team-456');

      // Test aggregation properties
      expect(userProps.aggs?.projects.key.kt).toBe('Project');
    });
  });
});

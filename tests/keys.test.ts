import { describe, expect, it } from 'vitest';
import type {
  AllItemTypeArrays,
  AllLocTypeArrays,
  ComKey,
  ItemTypeArray,
  LocKey,
  LocKeyArray,
  PriKey,
  UUID
} from '../src/keys';

describe('keys', () => {
  describe('UUID type', () => {
    it('should accept valid UUID format', () => {
      const validUUIDs: UUID[] = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
      ];

      validUUIDs.forEach(uuid => {
        expect(typeof uuid).toBe('string');
        expect(uuid).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);
      });
    });

    it('should handle UUID with different characters', () => {
      const uuid: UUID = '12345678-1234-5678-9abc-def123456789';
      expect(uuid).toBe('12345678-1234-5678-9abc-def123456789');
    });
  });

  describe('PriKey interface', () => {
    it('should create primary key with UUID', () => {
      const priKey: PriKey<'user'> = {
        kt: 'user',
        pk: '123e4567-e89b-12d3-a456-426614174000'
      };

      expect(priKey.kt).toBe('user');
      expect(priKey.pk).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create primary key with string', () => {
      const priKey: PriKey<'product'> = {
        kt: 'product',
        pk: 'prod-123'
      };

      expect(priKey.kt).toBe('product');
      expect(priKey.pk).toBe('prod-123');
    });

    it('should create primary key with number', () => {
      const priKey: PriKey<'order'> = {
        kt: 'order',
        pk: 12345
      };

      expect(priKey.kt).toBe('order');
      expect(priKey.pk).toBe(12345);
    });

    it('should handle readonly properties', () => {
      const priKey: PriKey<'test'> = {
        kt: 'test',
        pk: 'test-id'
      };

      // These should compile and work at runtime
      const kt = priKey.kt;
      const pk = priKey.pk;

      expect(kt).toBe('test');
      expect(pk).toBe('test-id');
    });
  });

  describe('LocKey interface', () => {
    it('should create location key with UUID', () => {
      const locKey: LocKey<'location'> = {
        kt: 'location',
        lk: '123e4567-e89b-12d3-a456-426614174000'
      };

      expect(locKey.kt).toBe('location');
      expect(locKey.lk).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create location key with string', () => {
      const locKey: LocKey<'region'> = {
        kt: 'region',
        lk: 'us-west-1'
      };

      expect(locKey.kt).toBe('region');
      expect(locKey.lk).toBe('us-west-1');
    });

    it('should create location key with number', () => {
      const locKey: LocKey<'zone'> = {
        kt: 'zone',
        lk: 1
      };

      expect(locKey.kt).toBe('zone');
      expect(locKey.lk).toBe(1);
    });

    it('should handle readonly properties', () => {
      const locKey: LocKey<'test'> = {
        kt: 'test',
        lk: 'test-loc'
      };

      const kt = locKey.kt;
      const lk = locKey.lk;

      expect(kt).toBe('test');
      expect(lk).toBe('test-loc');
    });
  });

  describe('ComKey interface', () => {
    it('should create composite key with no location keys', () => {
      const comKey: ComKey<'user'> = {
        kt: 'user',
        pk: 'user-123',
        loc: []
      };

      expect(comKey.kt).toBe('user');
      expect(comKey.pk).toBe('user-123');
      expect(comKey.loc).toEqual([]);
    });

    it('should create composite key with one location key', () => {
      const locKey: LocKey<'organization'> = {
        kt: 'organization',
        lk: 'org-123'
      };

      const comKey: ComKey<'user', 'organization'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [locKey]
      };

      expect(comKey.kt).toBe('user');
      expect(comKey.pk).toBe('user-123');
      expect(comKey.loc).toHaveLength(1);
      expect(comKey.loc[0]).toBe(locKey);
    });

    it('should create composite key with two location keys', () => {
      const locKey1: LocKey<'organization'> = {
        kt: 'organization',
        lk: 'org-123'
      };

      const locKey2: LocKey<'department'> = {
        kt: 'department',
        lk: 'dept-456'
      };

      const comKey: ComKey<'user', 'organization', 'department'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [locKey1, locKey2]
      };

      expect(comKey.kt).toBe('user');
      expect(comKey.pk).toBe('user-123');
      expect(comKey.loc).toHaveLength(2);
      expect(comKey.loc[0]).toBe(locKey1);
      expect(comKey.loc[1]).toBe(locKey2);
    });

    it('should create composite key with three location keys', () => {
      const locKey1: LocKey<'organization'> = { kt: 'organization', lk: 'org-123' };
      const locKey2: LocKey<'department'> = { kt: 'department', lk: 'dept-456' };
      const locKey3: LocKey<'team'> = { kt: 'team', lk: 'team-789' };

      const comKey: ComKey<'user', 'organization', 'department', 'team'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [locKey1, locKey2, locKey3]
      };

      expect(comKey.loc).toHaveLength(3);
      expect(comKey.loc[0].kt).toBe('organization');
      expect(comKey.loc[1].kt).toBe('department');
      expect(comKey.loc[2].kt).toBe('team');
    });

    it('should create composite key with four location keys', () => {
      const locKey1: LocKey<'organization'> = { kt: 'organization', lk: 'org-123' };
      const locKey2: LocKey<'department'> = { kt: 'department', lk: 'dept-456' };
      const locKey3: LocKey<'team'> = { kt: 'team', lk: 'team-789' };
      const locKey4: LocKey<'project'> = { kt: 'project', lk: 'proj-101' };

      const comKey: ComKey<'user', 'organization', 'department', 'team', 'project'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [locKey1, locKey2, locKey3, locKey4]
      };

      expect(comKey.loc).toHaveLength(4);
      expect(comKey.loc[3].kt).toBe('project');
    });

    it('should create composite key with five location keys', () => {
      const locKey1: LocKey<'organization'> = { kt: 'organization', lk: 'org-123' };
      const locKey2: LocKey<'department'> = { kt: 'department', lk: 'dept-456' };
      const locKey3: LocKey<'team'> = { kt: 'team', lk: 'team-789' };
      const locKey4: LocKey<'project'> = { kt: 'project', lk: 'proj-101' };
      const locKey5: LocKey<'module'> = { kt: 'module', lk: 'mod-202' };

      const comKey: ComKey<'user', 'organization', 'department', 'team', 'project', 'module'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [locKey1, locKey2, locKey3, locKey4, locKey5]
      };

      expect(comKey.loc).toHaveLength(5);
      expect(comKey.loc[4].kt).toBe('module');
    });

    it('should handle readonly properties', () => {
      const comKey: ComKey<'test'> = {
        kt: 'test',
        pk: 'test-id',
        loc: []
      };

      const kt = comKey.kt;
      const pk = comKey.pk;
      const loc = comKey.loc;

      expect(kt).toBe('test');
      expect(pk).toBe('test-id');
      expect(loc).toEqual([]);
    });
  });

  describe('LocKeyArray type', () => {
    it('should handle empty array when no location types', () => {
      const locArray: LocKeyArray = [];
      expect(locArray).toEqual([]);
      expect(locArray.length).toBe(0);
    });

    it('should handle single location key array', () => {
      const locKey: LocKey<'test'> = { kt: 'test', lk: 'test-id' };
      const locArray: LocKeyArray<'test'> = [locKey];

      expect(locArray).toHaveLength(1);
      expect(locArray[0]).toBe(locKey);
    });

    it('should handle multiple location key arrays', () => {
      const locKey1: LocKey<'L1'> = { kt: 'L1', lk: 'id1' };
      const locKey2: LocKey<'L2'> = { kt: 'L2', lk: 'id2' };
      const locArray: LocKeyArray<'L1', 'L2'> = [locKey1, locKey2];

      expect(locArray).toHaveLength(2);
      expect(locArray[0].kt).toBe('L1');
      expect(locArray[1].kt).toBe('L2');
    });
  });

  describe('ItemTypeArray type', () => {
    it('should handle single item type', () => {
      const itemTypes: ItemTypeArray<'S'> = ['S'];
      expect(itemTypes).toEqual(['S']);
      expect(itemTypes[0]).toBe('S');
    });

    it('should handle multiple item types', () => {
      const itemTypes: ItemTypeArray<'S', 'L1', 'L2'> = ['S', 'L1', 'L2'];
      expect(itemTypes).toHaveLength(3);
      expect(itemTypes[0]).toBe('S');
      expect(itemTypes[1]).toBe('L1');
      expect(itemTypes[2]).toBe('L2');
    });
  });

  describe('AllItemTypeArrays type', () => {
    it('should accept single item type array', () => {
      const itemTypes: AllItemTypeArrays<'S'> = ['S'] as const;
      expect(itemTypes).toEqual(['S']);
    });

    it('should accept two item type array', () => {
      const itemTypes: AllItemTypeArrays<'S', 'L1'> = ['S', 'L1'] as const;
      expect(itemTypes).toEqual(['S', 'L1']);
    });

    it('should accept three item type array', () => {
      const itemTypes: AllItemTypeArrays<'S', 'L1', 'L2'> = ['S', 'L1', 'L2'] as const;
      expect(itemTypes).toEqual(['S', 'L1', 'L2']);
    });

    it('should accept four item type array', () => {
      const itemTypes: AllItemTypeArrays<'S', 'L1', 'L2', 'L3'> = ['S', 'L1', 'L2', 'L3'] as const;
      expect(itemTypes).toEqual(['S', 'L1', 'L2', 'L3']);
    });

    it('should accept five item type array', () => {
      const itemTypes: AllItemTypeArrays<'S', 'L1', 'L2', 'L3', 'L4'> = ['S', 'L1', 'L2', 'L3', 'L4'] as const;
      expect(itemTypes).toEqual(['S', 'L1', 'L2', 'L3', 'L4']);
    });

    it('should accept six item type array', () => {
      const itemTypes: AllItemTypeArrays<'S', 'L1', 'L2', 'L3', 'L4', 'L5'> = ['S', 'L1', 'L2', 'L3', 'L4', 'L5'] as const;
      expect(itemTypes).toEqual(['S', 'L1', 'L2', 'L3', 'L4', 'L5']);
    });
  });

  describe('AllLocTypeArrays type', () => {
    it('should accept empty array', () => {
      const locTypes: AllLocTypeArrays = [] as const;
      expect(locTypes).toEqual([]);
    });

    it('should accept single location type array', () => {
      const locTypes: AllLocTypeArrays<'L1'> = ['L1'] as const;
      expect(locTypes).toEqual(['L1']);
    });

    it('should accept two location type array', () => {
      const locTypes: AllLocTypeArrays<'L1', 'L2'> = ['L1', 'L2'] as const;
      expect(locTypes).toEqual(['L1', 'L2']);
    });

    it('should accept three location type array', () => {
      const locTypes: AllLocTypeArrays<'L1', 'L2', 'L3'> = ['L1', 'L2', 'L3'] as const;
      expect(locTypes).toEqual(['L1', 'L2', 'L3']);
    });

    it('should accept four location type array', () => {
      const locTypes: AllLocTypeArrays<'L1', 'L2', 'L3', 'L4'> = ['L1', 'L2', 'L3', 'L4'] as const;
      expect(locTypes).toEqual(['L1', 'L2', 'L3', 'L4']);
    });

    it('should accept five location type array', () => {
      const locTypes: AllLocTypeArrays<'L1', 'L2', 'L3', 'L4', 'L5'> = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
      expect(locTypes).toEqual(['L1', 'L2', 'L3', 'L4', 'L5']);
    });
  });

  describe('Complex type combinations', () => {
    it('should work with nested composite keys', () => {
      const orgLoc: LocKey<'organization'> = { kt: 'organization', lk: 'org-123' };
      const deptLoc: LocKey<'department'> = { kt: 'department', lk: 'dept-456' };

      const userKey: ComKey<'user', 'organization', 'department'> = {
        kt: 'user',
        pk: 'user-123',
        loc: [orgLoc, deptLoc]
      };

      const userProfileKey: ComKey<'userProfile', 'user'> = {
        kt: 'userProfile',
        pk: 'profile-456',
        loc: [{
          kt: 'user',
          lk: userKey.pk
        }]
      };

      expect(userProfileKey.loc[0].kt).toBe('user');
      expect(userProfileKey.loc[0].lk).toBe('user-123');
    });

    it('should handle mixed key types in arrays', () => {
      const keys: (PriKey<'user'> | ComKey<'product', 'category'>)[] = [
        { kt: 'user', pk: 'user-1' },
        {
          kt: 'product',
          pk: 'prod-1',
          loc: [{ kt: 'category', lk: 'cat-1' }]
        }
      ];

      expect(keys).toHaveLength(2);
      expect(keys[0].kt).toBe('user');
      expect(keys[1].kt).toBe('product');
      // Type guard to check if the key has a loc property
      if ('loc' in keys[1]) {
        expect(keys[1].loc[0].kt).toBe('category');
      }
    });

    it('should validate readonly constraints', () => {
      const priKey: PriKey<'test'> = {
        kt: 'test',
        pk: 'test-id'
      };

      // Test that properties are actually readonly at runtime
      const kt = priKey.kt;
      const pk = priKey.pk;

      // These assignments should work (we're creating new variables, not modifying the object)
      expect(kt).toBe('test');
      expect(pk).toBe('test-id');

      // Verify the original object remains unchanged
      expect(priKey.kt).toBe('test');
      expect(priKey.pk).toBe('test-id');
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle empty strings as key types', () => {
      const priKey: PriKey<''> = {
        kt: '',
        pk: 'empty-key'
      };

      expect(priKey.kt).toBe('');
      expect(priKey.pk).toBe('empty-key');
    });

    it('should handle very long key types', () => {
      const longKeyType = 'very-long-key-type-name-that-exceeds-normal-lengths';
      const priKey: PriKey<typeof longKeyType> = {
        kt: longKeyType,
        pk: 'long-key-id'
      };

      expect(priKey.kt).toBe(longKeyType);
      expect(priKey.pk).toBe('long-key-id');
    });

    it('should handle numeric UUID-like strings', () => {
      const numericUUID: UUID = '12345678-1234-5678-1234-123456789012';
      const priKey: PriKey<'numeric'> = {
        kt: 'numeric',
        pk: numericUUID
      };

      expect(priKey.pk).toBe(numericUUID);
      expect(typeof priKey.pk).toBe('string');
    });

    it('should handle zero values', () => {
      const priKey: PriKey<'zero'> = {
        kt: 'zero',
        pk: 0
      };

      expect(priKey.pk).toBe(0);
      expect(typeof priKey.pk).toBe('number');
    });
  });
});

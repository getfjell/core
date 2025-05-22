import { isComItem, isPriItem, validateKeys, validatePK } from '@/item/IUtils';
import { Item } from '@/items';
import { AllItemTypeArrays, ComKey } from '@/keys';
import { describe, expect, test } from 'vitest';

describe('Testing IUtils', () => {
  const validItem: Item<'test'> = {
    key: { kt: 'test', pk: '1-1-1-1-1' },
    data: 'some data',
    events: {
      created: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      updated: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      deleted: { at: null }
    }
  };

  const invalidItem: Item<'test'> = {
    key: { kt: 'wrong', pk: '1-1-1-1-1' },
    data: 'some data',
    events: {
      created: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      updated: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      deleted: { at: null }
    }
  } as unknown as Item<'test'>;

  const tooManyKeysItem: Item<'test'> = {
    key: { kt: 'wrong', pk: '1-1-1-1-1', loc: [{ kt: 'random', lk: '4-4-4-4-4' }] },
    data: 'some data',
    events: {
      created: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      updated: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
      deleted: { at: null }
    }
  } as unknown as Item<'test'>;

  describe('Testing validatePK', () => {
    test('should validate a single item with correct pkType', () => {
      const result = validatePK(validItem, 'test');
      expect(result).toEqual(validItem);
    });

    test('should throw error for a single item with incorrect pkType', () => {
      expect(() => validatePK(invalidItem, 'test')).toThrow('Item does not have the correct primary key type');
    });

    test('should validate an array of items with correct pkType', () => {
      const items = [validItem, validItem];
      const result = validatePK(items, 'test');
      expect(result).toEqual(items);
    });

    test('should throw error for an array of items with incorrect pkType', () => {
      const items = [validItem, invalidItem];
      expect(() => validatePK(items, 'test')).toThrow('Item does not have the correct primary key type');
    });

    test('should throw error if item does not have a key', () => {
      const itemWithoutKey = { data: 'some data' } as unknown as Item<'test'>;
      expect(() => validatePK(itemWithoutKey, 'test')).toThrow('Item does not have a key');
    });

    test('should throw error if item is undefined', () => {
      // eslint-disable-next-line no-undefined
      const undefinedItem = undefined as unknown as Item<'test'>;
      expect(() => validatePK(undefinedItem, 'test')).toThrow('Validating PK, Item is undefined');
    });
  });

  describe('Testing validateKeys', () => {
    const keyTypes: AllItemTypeArrays<'test'> = ['test'];

    test('should validate item with correct key types', () => {
      const result = validateKeys(validItem, keyTypes);
      expect(result).toEqual(validItem);
    });

    test('should throw error for item with incorrect key types', () => {
      expect(() => validateKeys(invalidItem, keyTypes)).toThrow('Item does not have the correct key types');
    });

    test('should throw error if item does not have a key', () => {
      const itemWithoutKey = { data: 'some data' } as unknown as Item<'test'>;
      expect(() => validateKeys(itemWithoutKey, keyTypes))
        .toThrow('validating keys, item does not have a key: {"data":"some data"}');
    });

    test('should throw error if item too many keys', () => {
      expect(() => validateKeys(tooManyKeysItem, keyTypes)).toThrow('Item does not have the correct number of keys');
    });

    test('should throw error if item is null', () => {
      const nullItem = null as unknown as Item<'test'>;
      expect(() => validateKeys(nullItem, keyTypes))
        .toThrow('validating keys, item is undefined');
    });
  });

  describe('Testing isPriItem', () => {
    test('should return true for item with primary key', () => {
      const result = isPriItem(validItem);
      expect(result).toBe(true);
    });

    test('should return false for item with composite key', () => {
      const itemWithCompositeKey = {
        key: {
          kt: 'test',
          pk: '1-1-1-1-1',
          loc: [{ kt: 'random', lk: '4-4-4-4-4' }]
        } as ComKey<'test', 'random'>,
        data: 'some data',
        events: {
          created: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
          updated: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
          deleted: { at: null }
        }
      } as Item<'test'>;
      const result = isPriItem(itemWithCompositeKey);
      expect(result).toBe(false);
    });

    test('should return false for item without key', () => {
      const itemWithoutKey = { data: 'some data' } as unknown as Item<'test'>;
      const result = isPriItem(itemWithoutKey);
      expect(result).toBe(false);
    });
  });

  describe('Testing isComItem', () => {
    test('should return true for item with composite key', () => {
      const itemWithCompositeKey = {
        key: {
          kt: 'test',
          pk: '1-1-1-1-1',
          loc: [{ kt: 'random', lk: '4-4-4-4-4' }]
        } as ComKey<'test', 'random'>,
        data: 'some data',
        events: {
          created: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
          updated: { at: new Date(), by: { kt: 'test', pk: '1-1-1-1-1' } },
          deleted: { at: null }
        }
      } as Item<'test'>;
      const result = isComItem(itemWithCompositeKey);
      expect(result).toBe(true);
    });

    test('should return false for item with primary key', () => {
      const result = isComItem(validItem);
      expect(result).toBe(false);
    });

    test('should return false for item without key', () => {
      const itemWithoutKey = { data: 'some data' } as unknown as Item<'test'>;
      const result = isComItem(itemWithoutKey);
      expect(result).toBe(false);
    });
  });
});

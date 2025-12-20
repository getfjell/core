import { isComItem, isPriItem } from '../../src/item/IUtils';
import { Item } from '../../src/items';
import { ComKey } from '../../src/keys';
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

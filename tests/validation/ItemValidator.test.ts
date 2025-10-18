import { describe, expect, it } from 'vitest';
import { validateKeys, validatePK } from '../../src/validation/ItemValidator';
import type { Item } from '../../src/items';

describe('ItemValidator', () => {
  describe('validatePK', () => {
    describe('single item', () => {
      it('should accept valid item with correct pk type', () => {
        const item: Item<'product'> = {
          key: { kt: 'product', pk: '123' },
          state: {}
        };
        
        const result = validatePK(item, 'product');
        expect(result).toEqual(item);
      });

      it('should accept item with UUID pk', () => {
        const item: Item<'user'> = {
          key: { kt: 'user', pk: '123e4567-e89b-12d3-a456-426614174000' },
          state: { name: 'John' }
        };
        
        const result = validatePK(item, 'user');
        expect(result).toEqual(item);
      });

      it('should accept item with number pk', () => {
        const item: Item<'order'> = {
          key: { kt: 'order', pk: 12345 },
          state: { total: 99.99 }
        };
        
        const result = validatePK(item, 'order');
        expect(result).toEqual(item);
      });

      it('should accept composite item', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        const result = validatePK(item, 'product');
        expect(result).toEqual(item);
      });

      it('should reject undefined item', () => {
        expect(() => validatePK(undefined as any, 'product')).toThrow(
          /Item is undefined/
        );
      });

      it('should reject null item', () => {
        expect(() => validatePK(null as any, 'product')).toThrow(
          /Item is undefined/
        );
      });

      it('should reject item without key', () => {
        const item = { state: {} } as any;
        expect(() => validatePK(item, 'product')).toThrow(
          /Item does not have a key/
        );
      });

      it('should reject item with wrong pk type', () => {
        const item: Item<'order'> = {
          key: { kt: 'order', pk: '123' },
          state: {}
        };
        
        expect(() => validatePK(item, 'product')).toThrow(
          /Item does not have the correct primary key type/
        );
        expect(() => validatePK(item, 'product')).toThrow(
          /Expected product, got order/
        );
      });

      it('should validate composite item pk type correctly', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        // Should pass with correct type
        expect(() => validatePK(item, 'product')).not.toThrow();
        
        // Should fail with wrong type
        expect(() => validatePK(item, 'order')).toThrow(
          /Expected order, got product/
        );
      });
    });

    describe('array of items', () => {
      it('should accept array of valid items', () => {
        const items: Item<'product'>[] = [
          { key: { kt: 'product', pk: '1' }, state: {} },
          { key: { kt: 'product', pk: '2' }, state: {} },
          { key: { kt: 'product', pk: '3' }, state: {} }
        ];
        
        const result = validatePK(items, 'product');
        expect(result).toEqual(items);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(3);
      });

      it('should accept empty array', () => {
        const items: Item<'product'>[] = [];
        const result = validatePK(items, 'product');
        expect(result).toEqual([]);
      });

      it('should reject array with undefined item', () => {
        const items = [
          { key: { kt: 'product', pk: '1' }, state: {} },
          undefined,
          { key: { kt: 'product', pk: '3' }, state: {} }
        ] as any;
        
        expect(() => validatePK(items, 'product')).toThrow(
          /Item is undefined/
        );
      });

      it('should reject array with item missing key', () => {
        const items = [
          { key: { kt: 'product', pk: '1' }, state: {} },
          { state: {} },
          { key: { kt: 'product', pk: '3' }, state: {} }
        ] as any;
        
        expect(() => validatePK(items, 'product')).toThrow(
          /Item does not have a key/
        );
      });

      it('should reject array with wrong pk type', () => {
        const items = [
          { key: { kt: 'product', pk: '1' }, state: {} },
          { key: { kt: 'order', pk: '2' }, state: {} },
          { key: { kt: 'product', pk: '3' }, state: {} }
        ] as any;
        
        expect(() => validatePK(items, 'product')).toThrow(
          /Expected product, got order/
        );
      });

      it('should validate all items in array', () => {
        const items: Item<'product'>[] = [
          { key: { kt: 'product', pk: '1' }, state: { name: 'A' } },
          { key: { kt: 'product', pk: '2' }, state: { name: 'B' } },
          { key: { kt: 'product', pk: '3' }, state: { name: 'C' } }
        ];
        
        const result = validatePK(items, 'product') as Item<'product'>[];
        expect(result).toHaveLength(3);
        expect(result[0].state.name).toBe('A');
        expect(result[1].state.name).toBe('B');
        expect(result[2].state.name).toBe('C');
      });
    });
  });

  describe('validateKeys', () => {
    describe('primary items (kta.length === 1)', () => {
      it('should accept item with single key type', () => {
        const item: Item<'product'> = {
          key: { kt: 'product', pk: '123' },
          state: {}
        };
        
        const result = validateKeys(item, ['product']);
        expect(result).toEqual(item);
      });

      it('should reject item with wrong key type', () => {
        const item: Item<'order'> = {
          key: { kt: 'order', pk: '123' },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product'])).toThrow(
          /Item does not have the correct key types/
        );
        expect(() => validateKeys(item, ['product'])).toThrow(
          /Expected \[product\], but got \[order\]/
        );
      });

      it('should reject composite item when expecting primary', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product'])).toThrow(
          /Item does not have the correct number of keys/
        );
        expect(() => validateKeys(item, ['product'])).toThrow(
          /Expected 1, but got 2/
        );
      });
    });

    describe('composite items (kta.length > 1)', () => {
      it('should accept item with two-level keys', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        const result = validateKeys(item, ['product', 'store']);
        expect(result).toEqual(item);
      });

      it('should accept item with three-level keys', () => {
        const item: Item<'product', 'store', 'region'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [
              { kt: 'store', lk: '456' },
              { kt: 'region', lk: '789' }
            ]
          },
          state: {}
        };
        
        const result = validateKeys(item, ['product', 'store', 'region']);
        expect(result).toEqual(item);
      });

      it('should accept item with four-level keys', () => {
        const item: Item<'product', 'store', 'region', 'country'> = {
          key: {
            kt: 'product',
            pk: '1',
            loc: [
              { kt: 'store', lk: '2' },
              { kt: 'region', lk: '3' },
              { kt: 'country', lk: '4' }
            ]
          },
          state: {}
        };
        
        const result = validateKeys(item, ['product', 'store', 'region', 'country']);
        expect(result).toEqual(item);
      });

      it('should accept item with five-level keys', () => {
        const item: Item<'product', 'store', 'region', 'country', 'continent'> = {
          key: {
            kt: 'product',
            pk: '1',
            loc: [
              { kt: 'store', lk: '2' },
              { kt: 'region', lk: '3' },
              { kt: 'country', lk: '4' },
              { kt: 'continent', lk: '5' }
            ]
          },
          state: {}
        };
        
        const result = validateKeys(item, ['product', 'store', 'region', 'country', 'continent']);
        expect(result).toEqual(item);
      });

      it('should reject item with wrong number of keys (too few)', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product', 'store', 'region'])).toThrow(
          /Item does not have the correct number of keys/
        );
        expect(() => validateKeys(item, ['product', 'store', 'region'])).toThrow(
          /Expected 3, but got 2/
        );
      });

      it('should reject item with wrong number of keys (too many)', () => {
        const item: Item<'product', 'store', 'region'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [
              { kt: 'store', lk: '456' },
              { kt: 'region', lk: '789' }
            ]
          },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product', 'store'])).toThrow(
          /Item does not have the correct number of keys/
        );
        expect(() => validateKeys(item, ['product', 'store'])).toThrow(
          /Expected 2, but got 3/
        );
      });

      it('should reject item with wrong key types', () => {
        const item: Item<'product', 'store'> = {
          key: {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product', 'warehouse'])).toThrow(
          /Item does not have the correct key types/
        );
        expect(() => validateKeys(item, ['product', 'warehouse'])).toThrow(
          /Expected \[product, warehouse\], but got \[product, store\]/
        );
      });

      it('should reject primary item when expecting composite', () => {
        const item: Item<'product'> = {
          key: { kt: 'product', pk: '123' },
          state: {}
        };
        
        expect(() => validateKeys(item, ['product', 'store'])).toThrow(
          /Item does not have the correct number of keys/
        );
        expect(() => validateKeys(item, ['product', 'store'])).toThrow(
          /Expected 2, but got 1/
        );
      });
    });

    describe('error cases', () => {
      it('should reject undefined item', () => {
        expect(() => validateKeys(undefined as any, ['product'])).toThrow(
          /item is undefined/
        );
      });

      it('should reject null item', () => {
        expect(() => validateKeys(null as any, ['product'])).toThrow(
          /item is undefined/
        );
      });

      it('should reject item without key', () => {
        const item = { state: {} } as any;
        expect(() => validateKeys(item, ['product'])).toThrow(
          /item does not have a key/
        );
      });

      it('should include item in error message when key is missing', () => {
        const item = { state: { name: 'Test' } } as any;
        expect(() => validateKeys(item, ['product'])).toThrow(
          /{"state":{"name":"Test"}}/
        );
      });
    });

    describe('key type arrays', () => {
      it('should work with all hierarchy levels', () => {
        const levels = [
          ['product'],
          ['product', 'store'],
          ['product', 'store', 'region'],
          ['product', 'store', 'region', 'country'],
          ['product', 'store', 'region', 'country', 'continent']
        ] as const;

        levels.forEach((keyTypes) => {
          const loc = keyTypes.slice(1).map((kt, i) => ({ kt, lk: String(i + 1) }));
          const item: any = {
            key: keyTypes.length === 1
              ? { kt: keyTypes[0], pk: '0' }
              : { kt: keyTypes[0], pk: '0', loc },
            state: {}
          };
          
          expect(() => validateKeys(item, keyTypes as any)).not.toThrow();
        });
      });
    });

    describe('return value', () => {
      it('should return the validated item', () => {
        const item: Item<'product'> = {
          key: { kt: 'product', pk: '123' },
          state: { name: 'Test Product', price: 99.99 }
        };
        
        const result = validateKeys(item, ['product']);
        expect(result).toBe(item);
        expect(result.state.name).toBe('Test Product');
        expect(result.state.price).toBe(99.99);
      });
    });
  });
});


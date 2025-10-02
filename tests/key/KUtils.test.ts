 
import {
  abbrevIK,
  abbrevLKA,
  constructPriKey,
  createNormalizedHashFunction,
  generateKeyArray,
  ikToLKA,
  isComKey,
  isComKeyEqual,
  isComKeyEqualNormalized,
  isItemKey,
  isItemKeyEqual,
  isItemKeyEqualNormalized,
  isLocKey,
  isLocKeyEqual,
  isLocKeyEqualNormalized,
  isPriKey,
  isPriKeyEqual,
  isPriKeyEqualNormalized,
  isValidComKey,
  isValidItemKey,
  isValidLocKey,
  isValidLocKeyArray,
  isValidPriKey,
  itemKeyToLocKeyArray,
  locKeyArrayToItemKey,
  primaryType,
  toKeyTypeArray
} from '../../src/key/KUtils';
import { ComKey, LocKey, LocKeyArray, PriKey } from '../../src/keys';
import { describe, expect, it } from 'vitest';

describe('KUtils', () => {
  describe('isItemKeyEqual', () => {
    it('should return true for equal primary keys', () => {
      const a: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const b: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isItemKeyEqual(a, b)).toBe(true);
    });

    it('should return false for different primary keys', () => {
      const a: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const b: PriKey<'typeA'> = { pk: '321-342-353-234-222', kt: 'typeA' };
      expect(isItemKeyEqual(a, b)).toBe(false);
    });

    it('should return true for equal composite keys', () => {
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isItemKeyEqual(a, b)).toBe(true);
    });

    it('should return false for different composite keys', () => {
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '119-232-422-333-112', kt: 'typeB' }]
      };
      expect(isItemKeyEqual(a, b)).toBe(false);
    });

    it('should return false when comparing a primary key with a composite key', () => {
      const a: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isItemKeyEqual(a, b)).toBe(false);
    });

    it('should return false when comparing a primary key with a composite key', () => {
      const b: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isItemKeyEqual(a, b)).toBe(false);
    });

    it('should return false for composite keys with different primary keys', () => {
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '321-342-353-234-222',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isItemKeyEqual(a, b)).toBe(false);
    });

    it('should return false for composite keys with different length loc arrays', () => {
      const a: ComKey<'typeA', 'typeB', 'typeC'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { lk: '321-342-353-234-222', kt: 'typeB' },
          { lk: '111-222-333-444-555', kt: 'typeC' }
        ]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isItemKeyEqual<'typeA', 'typeB', 'typeC'>(a, b)).toBe(false);
    });

  });

  describe('isPriKeyEqual', () => {
    it('should return true for equal primary keys', () => {
      const a: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const b: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isPriKeyEqual(a, b)).toBe(true);
    });

    it('should return false for different primary keys', () => {
      const a: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const b: PriKey<'typeA'> = { pk: '321-342-353-234-222', kt: 'typeA' };
      expect(isPriKeyEqual(a, b)).toBe(false);
    });
  });

  describe('isLocKeyEqual', () => {
    it('should return true for equal location keys', () => {
      const a: LocKey<'typeA'> = { lk: '123-145-156-167-132', kt: 'typeA' };
      const b: LocKey<'typeA'> = { lk: '123-145-156-167-132', kt: 'typeA' };
      expect(isLocKeyEqual(a, b)).toBe(true);
    });

    it('should return false for different location keys', () => {
      const a: LocKey<'typeA'> = { lk: '123-145-156-167-132', kt: 'typeA' };
      const b: LocKey<'typeA'> = { lk: '321-342-353-234-222', kt: 'typeA' };
      expect(isLocKeyEqual(a, b)).toBe(false);
    });
  });

  describe('isComKeyEqual', () => {
    it('should return true for equal composite keys', () => {
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isComKeyEqual(a, b)).toBe(true);
    });

    it('should return false for different composite keys', () => {
      const a: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const b: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '119-232-422-333-112', kt: 'typeB' }]
      };
      expect(isComKeyEqual(a, b)).toBe(false);
    });
  });

  describe('isItemKey', () => {
    it('should return true for valid item key', () => {
      const key = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isItemKey(key)).toBe(true);
    });

    it('should return false for invalid item key', () => {
      const key = { kt: 'typeA' };
      expect(isItemKey(key)).toBe(false);
    });
  });

  describe('isComKey', () => {
    it('should return true for valid composite key', () => {
      const key = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isComKey(key)).toBe(true);
    });

    it('should return false for invalid composite key', () => {
      const key = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isComKey(key)).toBe(false);
    });
  });

  describe('isPriKey', () => {
    it('should return true for valid primary key', () => {
      const key = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isPriKey(key)).toBe(true);
    });

    it('should return false for invalid primary key', () => {
      const key = { kt: 'typeA' };
      expect(isPriKey(key)).toBe(false);
    });
  });

  describe('isLocKey', () => {
    it('should return true for valid location key', () => {
      const key = { lk: '123-145-156-167-132', kt: 'typeA' };
      expect(isLocKey(key)).toBe(true);
    });

    it('should return false for invalid location key', () => {
      const key = { kt: 'typeA' };
      expect(isLocKey(key)).toBe(false);
    });
  });

  describe('generateKeyArray', () => {
    it('should generate key array from item key', () => {
      const key: ComKey<'typeA', 'typeB'> =
        { pk: '123-145-156-167-132', kt: 'typeA', loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }] };
      const result = generateKeyArray(key);
      expect(result).toEqual([{ pk: '123-145-156-167-132', kt: 'typeA' }, { lk: '321-342-353-234-222', kt: 'typeB' }]);
    });

    it('should generate key array from location key array', () => {
      const key: LocKeyArray<string> = [{ lk: '321-342-353-234-222', kt: 'typeB' }];
      const result = generateKeyArray(key);
      expect(result).toEqual([{ lk: '321-342-353-234-222', kt: 'typeB' }]);
    });

    it('should generate key array from primary key', () => {
      const key: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = generateKeyArray(key);
      expect(result).toEqual([{ pk: '123-145-156-167-132', kt: 'typeA' }]);
    });
  });

  describe('constructPriKey', () => {
    it('should construct primary key from string', () => {
      const result = constructPriKey('123-145-156-167-132', 'typeA');
      expect(result).toEqual({ pk: '123-145-156-167-132', kt: 'typeA' });
    });

    it('should construct primary key from PriKey object', () => {
      const priKey: PriKey<string> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = constructPriKey(priKey, 'typeA');
      expect(result).toEqual(priKey);
    });
  });

  describe('toKeyTypeArray', () => {
    it('should convert item key to key type array', () => {
      const key: ComKey<'typeA', 'typeB'> =
        { pk: '123-145-156-167-132', kt: 'typeA', loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }] };
      const result = toKeyTypeArray(key);
      expect(result).toEqual(['typeA', 'typeB']);
    });
  });

  describe('abbrevIK', () => {
    it('should abbreviate item key', () => {
      const key: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = abbrevIK(key);
      expect(result).toBe('typeA:123-145-156-167-132');
    });

    it('should abbreviate composite item key', () => {
      const key: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const result = abbrevIK(key);
      expect(result).toBe('typeA:123-145-156-167-132:typeB:321-342-353-234-222');
    });

    it('should return "null IK" for null item key', () => {
      const key: PriKey<'typeA'> | null = null;
      // @ts-ignore
      const result = abbrevIK(key);
      expect(result).toBe('null IK');
    });
  });

  describe('abbrevLKA', () => {
    it('should abbreviate location key array', () => {
      const keyArray: Array<LocKey<'typeA'>> = [{ lk: '123-145-156-167-132', kt: 'typeA' }];
      const result = abbrevLKA(keyArray);
      expect(result).toBe('typeA:123-145-156-167-132');
    });

    it('should return "null LKA" for null key array', () => {
      const keyArray: Array<LocKey<'typeA'>> | null = null;
      const result = abbrevLKA(keyArray);
      expect(result).toBe('null LKA');
    });

    it('should handle null values within the location key array', () => {
      const keyArray: Array<LocKey<'typeA'> | null> = [{ lk: '123-145-156-167-132', kt: 'typeA' }, null];
      const result = abbrevLKA(keyArray as unknown as Array<LocKey<'typeA'>>);
      expect(result).toBe('typeA:123-145-156-167-132,');
    });
  });

  describe('primaryType', () => {
    it('should return primary type of item key', () => {
      const key: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = primaryType(key);
      expect(result).toBe('typeA');
    });

    it('should return primary type of composite key', () => {
      const key: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      const result = primaryType(key);
      expect(result).toBe('typeA');
    });
  });

  describe('itemKeyToLocKeyArray', () => {
    it('should convert item key to location key array', () => {
      const key: PriKey<string> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = itemKeyToLocKeyArray(key);
      expect(result).toEqual([{ kt: 'typeA', lk: '123-145-156-167-132' }]);
    });

    it('should convert composite item key to location key array', () => {
      const key: ComKey<'typeA', 'typeB', 'typeC'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { lk: '321-342-353-234-222', kt: 'typeB' },
          { lk: '111-222-333-444-555', kt: 'typeC' }
        ]
      };
      const result = itemKeyToLocKeyArray(key);
      expect(result).toEqual([
        { kt: 'typeA', lk: '123-145-156-167-132' },
        { kt: 'typeB', lk: '321-342-353-234-222' },
        { kt: 'typeC', lk: '111-222-333-444-555' }
      ]);
    });
  });

  describe('locKeyArrayToItemKey', () => {
    it('should convert a single location key to a primary key', () => {
      const lka: LocKeyArray<'typeA'> = [{ lk: '123-145-156-167-132', kt: 'typeA' }];
      const result = locKeyArrayToItemKey(lka);
      expect(result).toEqual({ pk: '123-145-156-167-132', kt: 'typeA' });
    });

    it('should convert multiple location keys to a composite key', () => {
      const lka: LocKeyArray<'typeA', 'typeB', 'typeC'> = [
        { lk: '123-145-156-167-132', kt: 'typeA' },
        { lk: '321-342-353-234-222', kt: 'typeB' },
        { lk: '111-222-333-444-555', kt: 'typeC' }
      ];
      const result = locKeyArrayToItemKey(lka);
      expect(result).toEqual({
        pk: '123-145-156-167-132', kt: 'typeA',
        loc: [
          { lk: '321-342-353-234-222', kt: 'typeB' },
          { lk: '111-222-333-444-555', kt: 'typeC' }
        ]
      });
    });
  });

  describe('ikToLKA', () => {
    it('should convert primary key to location key array', () => {
      const key: PriKey<string> = { pk: '123-145-156-167-132', kt: 'typeA' };
      const result = ikToLKA(key);
      expect(result).toEqual([{ kt: 'typeA', lk: '123-145-156-167-132' }]);
    });

    it('should convert composite key to location key array', () => {
      const key: ComKey<'typeA', 'typeB', 'typeC'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { lk: '321-342-353-234-222', kt: 'typeB' },
          { lk: '111-222-333-444-555', kt: 'typeC' }
        ]
      };
      const result = ikToLKA(key);
      expect(result).toEqual([
        { kt: 'typeA', lk: '123-145-156-167-132' },
        { kt: 'typeB', lk: '321-342-353-234-222' },
        { kt: 'typeC', lk: '111-222-333-444-555' }
      ]);
    });
  });

  describe('isValidPriKey', () => {
    it('should return true for valid primary key', () => {
      const key: PriKey<'typeA'> = { kt: 'typeA', pk: '123-145-156-167-132' };
      expect(isValidPriKey(key)).toBe(true);
    });

    it('should return false when pk is undefined', () => {
      const key: any = { kt: 'typeA' };
      expect(isValidPriKey(key)).toBe(false);
    });

    it('should return false when kt is undefined', () => {
      const key: any = { pk: '123-145-156-167-132' };
      expect(isValidPriKey(key)).toBe(false);
    });
  });

  describe('isValidLocKey', () => {
    it('should return true for valid location key', () => {
      const key: LocKey<'typeA'> = { kt: 'typeA', lk: '123-145-156-167-132' };
      expect(isValidLocKey(key)).toBe(true);
    });

    it('should return false when lk is undefined', () => {
      const key: any = { kt: 'typeA' };
      expect(isValidLocKey(key)).toBe(false);
    });

    it('should return false when kt is undefined', () => {
      const key: any = { lk: '123-145-156-167-132' };
      expect(isValidLocKey(key)).toBe(false);
    });
  });

  describe('isValidLocKeyArray', () => {
    it('should return true for array of valid location keys', () => {
      const keyArray: Array<LocKey<'typeA'> | LocKey<'typeB'>> = [
        { kt: 'typeA', lk: '123-145-156-167-132' },
        { kt: 'typeB', lk: '321-342-353-234-222' }
      ];
      expect(isValidLocKeyArray(keyArray)).toBe(true);
    });

    it('should return false if any key in array is invalid', () => {
      const keyArray: Array<any> = [
        { kt: 'typeA', lk: '123-145-156-167-132' },
        { kt: 'typeB' } // Missing lk
      ];
      expect(isValidLocKeyArray(keyArray)).toBe(false);
    });
  });

  describe('isValidComKey', () => {
    it('should return true for valid composite key', () => {
      const key: ComKey<'typeA', 'typeB', 'typeC'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' },
          { kt: 'typeC', lk: '111-222-333-444-555' }
        ]
      };
      expect(isValidComKey(key)).toBe(true);
    });

    it('should return false when primary key is invalid', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        party: { kt: 'typeA' },
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' }
        ]
      };
      // @ts-ignore
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when location array contains invalid key', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: 'typeB' } // Missing lk
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false for null composite key', () => {
      const key: any = null;
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false for undefined composite key', () => {
      const key: any = undefined;
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when primary key has empty string pk', () => {
      const key: any = {
        pk: '',
        kt: 'typeA',
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when primary key has null pk', () => {
      const key: any = {
        pk: null,
        kt: 'typeA',
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when primary key has empty string kt', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: '',
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when primary key has null kt', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: null,
        loc: [
          { kt: 'typeB', lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when location key has empty string lk', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: 'typeB', lk: '' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when location key has null lk', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: 'typeB', lk: null }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when location key has empty string kt', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: '', lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });

    it('should return false when location key has null kt', () => {
      const key: any = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [
          { kt: null, lk: '321-342-353-234-222' }
        ]
      };
      expect(isValidComKey(key)).toBe(false);
    });
  });

  describe('isValidItemKey', () => {
    it('should return true for valid primary key', () => {
      const key: PriKey<'typeA'> = { pk: '123-145-156-167-132', kt: 'typeA' };
      expect(isValidItemKey(key)).toBe(true);
    });

    it('should return true for valid composite key', () => {
      const key: ComKey<'typeA', 'typeB'> = {
        pk: '123-145-156-167-132',
        kt: 'typeA',
        loc: [{ lk: '321-342-353-234-222', kt: 'typeB' }]
      };
      expect(isValidItemKey(key)).toBe(true);
    });

    it('should return false for invalid item key', () => {
      const key: any = { pk: '123-145-156-167-132' };
      expect(isValidItemKey(key)).toBe(false);
    });

    it('should return false for undefined item key', () => {
      const key: any = undefined;
      expect(isValidItemKey(key)).toBe(false);
    });

    it('should return false for invalid primary key', () => {
      const key: any = { pk: '123-145-156-167-132' };
      expect(isValidItemKey(key)).toBe(false);
    });
  });

  describe('Normalized Comparison Functions', () => {
    describe('createNormalizedHashFunction', () => {
      it('should create hash function for primitive keys', () => {
        const hashFn = createNormalizedHashFunction<string>();
        const key = 'test-key';
        const hash = hashFn(key);
        expect(hash).toBe('"test-key"');
      });

      it('should create hash function for object keys with pk', () => {
        const hashFn = createNormalizedHashFunction<{ pk: string | number; kt: string }>();
        const key = { pk: 123, kt: 'test' };
        const hash = hashFn(key);
        expect(hash).toBe('{"pk":"123","kt":"test"}');
      });

      it('should create hash function for object keys with lk', () => {
        const hashFn = createNormalizedHashFunction<{ lk: string | number; kt: string }>();
        const key = { lk: 456, kt: 'test' };
        const hash = hashFn(key);
        expect(hash).toBe('{"lk":"456","kt":"test"}');
      });

      it('should create hash function for object keys with loc array', () => {
        const hashFn = createNormalizedHashFunction<{ pk: string; kt: string; loc: Array<{ lk: string | number; kt: string }> }>();
        const key = { pk: '123', kt: 'test', loc: [{ lk: 456, kt: 'loc1' }, { lk: 789, kt: 'loc2' }] };
        const hash = hashFn(key);
        expect(hash).toBe('{"pk":"123","kt":"test","loc":[{"lk":"456","kt":"loc1"},{"lk":"789","kt":"loc2"}]}');
      });

      it('should handle null and undefined values in loc array', () => {
        const hashFn = createNormalizedHashFunction<{ pk: string; kt: string; loc: Array<{ lk: string | number | null | undefined; kt: string }> }>();
        const key = { pk: '123', kt: 'test', loc: [{ lk: null, kt: 'loc1' }, { lk: undefined, kt: 'loc2' }] };
        const hash = hashFn(key);
        // JSON.stringify converts undefined to undefined (which gets omitted), so we expect the second element to not have lk
        expect(hash).toBe('{"pk":"123","kt":"test","loc":[{"lk":null,"kt":"loc1"},{"kt":"loc2"}]}');
      });

      it('should handle non-object keys', () => {
        const hashFn = createNormalizedHashFunction<any>();
        const key = null;
        const hash = hashFn(key);
        expect(hash).toBe('null');
      });
    });

    describe('isPriKeyEqualNormalized', () => {
      it('should return true for equal primary keys with string pk', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        expect(isPriKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal primary keys with number pk', () => {
        const a: PriKey<'typeA'> = { pk: 123, kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: 123, kt: 'typeA' };
        expect(isPriKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal primary keys with mixed pk types', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: 123, kt: 'typeA' };
        expect(isPriKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return false for different primary keys', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: '456', kt: 'typeA' };
        expect(isPriKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different key types', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeB'> = { pk: '123', kt: 'typeB' };
        expect(isPriKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return null when first key is null', () => {
        const a: PriKey<'typeA'> | null = null;
        const b: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        expect(isPriKeyEqualNormalized(a as any, b)).toBe(null);
      });

      it('should return null when second key is null', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> | null = null;
        expect(isPriKeyEqualNormalized(a, b as any)).toBe(null);
      });
    });

    describe('isLocKeyEqualNormalized', () => {
      it('should return true for equal location keys with string lk', () => {
        const a: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        const b: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        expect(isLocKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal location keys with number lk', () => {
        const a: LocKey<'typeA'> = { lk: 123, kt: 'typeA' };
        const b: LocKey<'typeA'> = { lk: 123, kt: 'typeA' };
        expect(isLocKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal location keys with mixed lk types', () => {
        const a: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        const b: LocKey<'typeA'> = { lk: 123, kt: 'typeA' };
        expect(isLocKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return false for different location keys', () => {
        const a: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        const b: LocKey<'typeA'> = { lk: '456', kt: 'typeA' };
        expect(isLocKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different key types', () => {
        const a: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        const b: LocKey<'typeB'> = { lk: '123', kt: 'typeB' };
        expect(isLocKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return null when first key is null', () => {
        const a: LocKey<'typeA'> | null = null;
        const b: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        expect(isLocKeyEqualNormalized(a as any, b)).toBe(null);
      });

      it('should return null when second key is null', () => {
        const a: LocKey<'typeA'> = { lk: '123', kt: 'typeA' };
        const b: LocKey<'typeA'> | null = null;
        expect(isLocKeyEqualNormalized(a, b as any)).toBe(null);
      });
    });

    describe('isComKeyEqualNormalized', () => {
      it('should return true for equal composite keys', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal composite keys with number pk/lk', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: 123,
          kt: 'typeA',
          loc: [{ lk: 456, kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: 123,
          kt: 'typeA',
          loc: [{ lk: 456, kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal composite keys with mixed types', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: 456, kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: 123,
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return false for different primary keys', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '789',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different key types', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeC', 'typeB'> = {
          pk: '123',
          kt: 'typeC',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different location array lengths', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB', 'typeC'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }, { lk: '789', kt: 'typeC' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different location keys', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '789', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false when first key is null', () => {
        const a: ComKey<'typeA', 'typeB'> | null = null;
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isComKeyEqualNormalized(a as any, b)).toBe(false);
      });

      it('should return false when second key is null', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> | null = null;
        expect(isComKeyEqualNormalized(a, b as any)).toBe(false);
      });
    });

    describe('isItemKeyEqualNormalized', () => {
      it('should return true for equal primary keys', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        expect(isItemKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return true for equal composite keys', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isItemKeyEqualNormalized(a, b)).toBe(true);
      });

      it('should return false when comparing primary key with composite key', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isItemKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false when comparing composite key with primary key', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        expect(isItemKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different primary keys', () => {
        const a: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const b: PriKey<'typeA'> = { pk: '789', kt: 'typeA' };
        expect(isItemKeyEqualNormalized(a, b)).toBe(false);
      });

      it('should return false for different composite keys', () => {
        const a: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        const b: ComKey<'typeA', 'typeB'> = {
          pk: '123',
          kt: 'typeA',
          loc: [{ lk: '789', kt: 'typeB' }]
        };
        expect(isItemKeyEqualNormalized(a, b)).toBe(false);
      });

    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('locKeyArrayToItemKey', () => {
      it('should throw error for undefined location key array', () => {
        const lka: any = undefined;
        expect(() => locKeyArrayToItemKey(lka)).toThrow('locKeyArrayToItemKey: lka is undefined or empty');
      });

      it('should throw error for null location key array', () => {
        const lka: any = null;
        expect(() => locKeyArrayToItemKey(lka)).toThrow('locKeyArrayToItemKey: lka is undefined or empty');
      });

      it('should throw error for empty location key array', () => {
        const lka: LocKeyArray<'typeA'> = [];
        expect(() => locKeyArrayToItemKey(lka)).toThrow('locKeyArrayToItemKey: lka is undefined or empty');
      });

      it('should handle location key array with undefined first element', () => {
        const lka: any = [undefined, { lk: '456', kt: 'typeB' }];
        expect(() => locKeyArrayToItemKey(lka)).toThrow('locKeyArrayToItemKey: lka is undefined or empty');
      });
    });

    describe('isValidPriKey', () => {
      it('should return false for null key', () => {
        const key: any = null;
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for undefined key', () => {
        const key: any = undefined;
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for empty string pk', () => {
        const key: any = { pk: '', kt: 'typeA' };
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for null pk', () => {
        const key: any = { pk: null, kt: 'typeA' };
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for empty string kt', () => {
        const key: any = { pk: '123', kt: '' };
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for null kt', () => {
        const key: any = { pk: '123', kt: null };
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for string "null" pk', () => {
        const key: any = { pk: 'null', kt: 'typeA' };
        expect(isValidPriKey(key)).toBe(false);
      });

      it('should return false for string "null" kt', () => {
        const key: any = { pk: '123', kt: 'null' };
        expect(isValidPriKey(key)).toBe(false);
      });
    });

    describe('isValidLocKey', () => {
      it('should return false for null key', () => {
        const key: any = null;
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for undefined key', () => {
        const key: any = undefined;
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for empty string lk', () => {
        const key: any = { lk: '', kt: 'typeA' };
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for null lk', () => {
        const key: any = { lk: null, kt: 'typeA' };
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for empty string kt', () => {
        const key: any = { lk: '123', kt: '' };
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for null kt', () => {
        const key: any = { lk: '123', kt: null };
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for string "null" lk', () => {
        const key: any = { lk: 'null', kt: 'typeA' };
        expect(isValidLocKey(key)).toBe(false);
      });

      it('should return false for string "null" kt', () => {
        const key: any = { lk: '123', kt: 'null' };
        expect(isValidLocKey(key)).toBe(false);
      });
    });

    describe('isValidLocKeyArray', () => {
      it('should return false for null array', () => {
        const keyArray: any = null;
        expect(isValidLocKeyArray(keyArray)).toBe(false);
      });

      it('should return false for undefined array', () => {
        const keyArray: any = undefined;
        expect(isValidLocKeyArray(keyArray)).toBe(false);
      });

      it('should return true for empty array', () => {
        const keyArray: Array<LocKey<'typeA'>> = [];
        expect(isValidLocKeyArray(keyArray)).toBe(true);
      });

      it('should return false for array with null elements', () => {
        const keyArray: Array<LocKey<'typeA'> | null> = [
          { lk: '123', kt: 'typeA' },
          null
        ];
        expect(isValidLocKeyArray(keyArray as any)).toBe(false);
      });

      it('should return false for array with undefined elements', () => {
        const keyArray: Array<LocKey<'typeA'> | undefined> = [
          { lk: '123', kt: 'typeA' },
          undefined
        ];
        expect(isValidLocKeyArray(keyArray as any)).toBe(false);
      });
    });

    describe('isValidComKey', () => {
      it('should return false for null key', () => {
        const key: any = null;
        expect(isValidComKey(key)).toBe(false);
      });

      it('should return false for undefined key', () => {
        const key: any = undefined;
        expect(isValidComKey(key)).toBe(false);
      });

      it('should return false for key without pk', () => {
        const key: any = {
          kt: 'typeA',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isValidComKey(key)).toBe(false);
      });

      it('should return false for key without kt', () => {
        const key: any = {
          pk: '123',
          loc: [{ lk: '456', kt: 'typeB' }]
        };
        expect(isValidComKey(key)).toBe(false);
      });

      it('should return false for key without loc', () => {
        const key: any = {
          pk: '123',
          kt: 'typeA'
        };
        expect(isValidComKey(key)).toBe(false);
      });

      it('should return true for key with empty loc array', () => {
        const key: any = {
          pk: '123',
          kt: 'typeA',
          loc: []
        };
        expect(isValidComKey(key)).toBe(true);
      });
    });

    describe('isValidItemKey', () => {
      it('should return false for null key', () => {
        const key: any = null;
        expect(() => isValidItemKey(key)).toThrow();
      });

      it('should return false for undefined key', () => {
        const key: any = undefined;
        expect(isValidItemKey(key)).toBe(false);
      });

      it('should return false for key without pk', () => {
        const key: any = { kt: 'typeA' };
        expect(isValidItemKey(key)).toBe(false);
      });

      it('should return false for key without kt', () => {
        const key: any = { pk: '123' };
        expect(isValidItemKey(key)).toBe(false);
      });
    });

    describe('generateKeyArray', () => {
      it('should handle empty location key array', () => {
        const key: LocKeyArray<'typeA'> = [] as any;
        const result = generateKeyArray(key);
        expect(result).toEqual([]);
      });

      it('should handle location key array with null elements', () => {
        const key: Array<LocKey<'typeA'> | null> = [
          { lk: '123', kt: 'typeA' },
          null,
          { lk: '456', kt: 'typeA' }
        ];
        const result = generateKeyArray(key as any);
        expect(result).toEqual([
          { lk: '123', kt: 'typeA' },
          null,
          { lk: '456', kt: 'typeA' }
        ]);
      });
    });

    describe('toKeyTypeArray', () => {
      it('should handle primary key', () => {
        const key: PriKey<'typeA'> = { pk: '123', kt: 'typeA' };
        const result = toKeyTypeArray(key);
        expect(result).toEqual(['typeA']);
      });

      it('should handle composite key with multiple location types', () => {
        const key: ComKey<'typeA', 'typeB', 'typeC', 'typeD', 'typeE'> = {
          pk: '123',
          kt: 'typeA',
          loc: [
            { lk: '456', kt: 'typeB' },
            { lk: '789', kt: 'typeC' },
            { lk: '012', kt: 'typeD' },
            { lk: '345', kt: 'typeE' }
          ]
        };
        const result = toKeyTypeArray(key);
        expect(result).toEqual(['typeA', 'typeB', 'typeC', 'typeD', 'typeE']);
      });
    });

    describe('abbrevIK', () => {
      it('should handle undefined key', () => {
        const key: any = undefined;
        const result = abbrevIK(key);
        expect(result).toBe('null IK');
      });

      it('should handle composite key with multiple location keys', () => {
        const key: ComKey<'typeA', 'typeB', 'typeC'> = {
          pk: '123',
          kt: 'typeA',
          loc: [
            { lk: '456', kt: 'typeB' },
            { lk: '789', kt: 'typeC' }
          ]
        };
        const result = abbrevIK(key);
        expect(result).toBe('typeA:123:typeB:456,typeC:789');
      });
    });

    describe('abbrevLKA', () => {
      it('should handle undefined key array', () => {
        const keyArray: any = undefined;
        const result = abbrevLKA(keyArray);
        expect(result).toBe('null LKA');
      });

      it('should handle empty key array', () => {
        const keyArray: Array<LocKey<'typeA'>> = [];
        const result = abbrevLKA(keyArray);
        expect(result).toBe('');
      });

      it('should handle key array with undefined elements', () => {
        const keyArray: Array<LocKey<'typeA'> | undefined> = [
          { lk: '123', kt: 'typeA' },
          undefined
        ];
        const result = abbrevLKA(keyArray as any);
        expect(result).toBe('typeA:123,');
      });
    });

    describe('constructPriKey', () => {
      it('should handle number pk', () => {
        const result = constructPriKey(123, 'typeA');
        expect(result).toEqual({ pk: 123, kt: 'typeA' });
      });

      it('should handle number pk in PriKey object', () => {
        const priKey: PriKey<string> = { pk: '123', kt: 'typeA' };
        const result = constructPriKey(priKey, 'typeA');
        expect(result).toEqual(priKey);
      });
    });
  });
});

/* eslint-disable max-lines */

/* eslint-disable no-undefined */
import {
  abbrevIK,
  abbrevLKA,
  constructPriKey,
  generateKeyArray,
  ikToLKA,
  isComKey,
  isComKeyEqual,
  isItemKey,
  isItemKeyEqual,
  isLocKey,
  isLocKeyEqual,
  isPriKey,
  isPriKeyEqual,
  isValidComKey,
  isValidItemKey,
  isValidLocKey,
  isValidLocKeyArray,
  isValidPriKey,
  itemKeyToLocKeyArray,
  locKeyArrayToItemKey,
  primaryType,
  toKeyTypeArray
} from '@/key/KUtils';
import { ComKey, LocKey, LocKeyArray, PriKey } from '@/keys';

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
});

